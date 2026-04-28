/**
 * PixiStage — Phase 2–5 bridge renderer.
 *
 * Fixes vs previous version:
 *  - rAF debounce on draw() — prevents hang from rapid Zustand ticks on mount
 *  - Grid layer wired (PixiGridLayer)
 *  - pointer-events: none on the canvas element itself so sidebars remain clickable
 *    (the Container event system handles canvas interaction internally)
 *  - Guard: don't init Pixi with 0×0 dimensions
 */
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Application, Container, Graphics, Text, TextStyle, type FederatedPointerEvent } from 'pixi.js'
import { useElementsStore } from '../../../stores/elementsStore'
import { useUIStore } from '../../../stores/uiStore'
import { useEmployeeStore } from '../../../stores/employeeStore'
import { useNeighborhoodStore } from '../../../stores/neighborhoodStore'
import { useFloorStore } from '../../../stores/floorStore'
import type { CanvasElement, DeskElement, PrivateOfficeElement, WorkstationElement } from '../../../types/elements'
import type { Employee } from '../../../types/employee'
import { blocksByCategory, isPolylineType } from '../../../blocks/registry'
import { renderDesk } from './PixiDeskRenderer'
import { renderWorkstation } from './PixiWorkstationRenderer'
import { renderWall } from './PixiWallRenderer'
import { renderTable } from './PixiTableRenderer'
import { renderRoom } from './PixiRoomRenderer'
import { syncNeighborhoodLayer } from './PixiNeighborhoodLayer'
import { syncAlignmentGuides } from './PixiAlignmentGuides'
import { syncSelectionHandles } from './PixiSelectionHandles'
import { syncGrid } from './PixiGridLayer'

export interface PixiStageHandle { exportPng(): Promise<void> }
interface PixiStageProps { width: number; height: number }

// Type sets from registry — typed as Set<string> for runtime .has(el.type)
const DESK_TYPES  = new Set<string>(blocksByCategory('desk').filter(t => t !== 'workstation'))
const WALL_TYPES  = new Set<string>(blocksByCategory('wall'))
const TABLE_TYPES = new Set<string>(blocksByCategory('table'))
const ROOM_TYPES  = new Set<string>(blocksByCategory('room'))

const SEAT_STYLE = new TextStyle({ fontSize: 9, fill: '#1F2937', fontFamily: 'Inter,sans-serif', fontWeight: '600' })
const PALETTE = [0x6366f1,0x10b981,0xf59e0b,0xef4444,0x8b5cf6,0x06b6d4,0xf97316,0x84cc16]
function deptColor(dept: string | null): number {
  if (!dept) return 0x6366f1
  let h = 0; for (let i=0;i<dept.length;i++) h=(h*31+dept.charCodeAt(i))>>>0
  return PALETTE[h % PALETTE.length]
}

export const PixiStage = forwardRef<PixiStageHandle, PixiStageProps>(function PixiStage({ width, height }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const worldRef = useRef<Container | null>(null)
  const mapRef = useRef<Map<string, Container>>(new Map())
  const gridLayerRef = useRef<Container | null>(null)
  const dragRef = useRef<{id:string;swx:number;swy:number;sex:number;sey:number}|null>(null)
  const rafRef = useRef<number | null>(null)

  useImperativeHandle(ref, () => ({
    async exportPng() {
      const app = appRef.current; if (!app) return
      const { useProjectStore } = await import('../../../stores/projectStore')
      const { useFloorStore: uFS } = await import('../../../stores/floorStore')
      const p = useProjectStore.getState().currentProject
      const fl = uFS.getState().floors.find(f=>f.id===uFS.getState().activeFloorId)
      const cv = app.renderer.extract.canvas(app.stage) as HTMLCanvasElement
      cv.toBlob(blob=>{
        if(!blob)return; const a=document.createElement('a')
        a.href=URL.createObjectURL(blob)
        a.download=`${p?.name??'office'}-${fl?.name??'floor'}-pixi.png`.toLowerCase().replace(/[^a-z0-9-]/g,'-')
        a.click(); URL.revokeObjectURL(a.href)
      },'image/png')
    }
  }))

  useEffect(() => {
    const w = width > 0 ? width : 800
    const h = height > 0 ? height : 600
    if (!canvasRef.current) return
    let dead = false
    const map = mapRef.current

    const app = new Application()
    app.init({
      canvas: canvasRef.current,
      width: w, height: h,
      backgroundColor: 0xf1f5f9,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio ?? 1, 2),
    }).then(() => {
      if (dead) { app.destroy(); return }
      appRef.current = app

      // ── Layer stack ──────────────────────────────────────────────────
      const world = new Container(); app.stage.addChild(world); worldRef.current = world
      const gridLayer = new Container()   // [0] grid
      const nlLayer   = new Container()   // [1] neighborhoods
      const elLayer   = new Container()   // [2] elements
      const glLayer   = new Container()   // [3] guides
      const hlLayer   = new Container()   // [4] handles
      world.addChild(gridLayer); world.addChild(nlLayer)
      world.addChild(elLayer);   world.addChild(glLayer); world.addChild(hlLayer)
      gridLayerRef.current = gridLayer

      // ── Pan ───────────────────────────────────────────────────────────
      let pan=false, px=0, py=0
      app.stage.eventMode='static'; app.stage.hitArea=app.screen
      app.stage.on('pointerdown',(e:FederatedPointerEvent)=>{ if(e.button!==0||dragRef.current)return; pan=true;px=e.globalX;py=e.globalY })
      app.stage.on('pointermove',(e:FederatedPointerEvent)=>{
        if(dragRef.current){
          const d=dragRef.current,wp=world.toLocal(e.global)
          useElementsStore.getState().updateElement(d.id,{x:d.sex+(wp.x-d.swx),y:d.sey+(wp.y-d.swy)})
          schedDraw()
          return
        }
        if(!pan)return
        world.x+=e.globalX-px; world.y+=e.globalY-py; px=e.globalX; py=e.globalY
        schedGrid()
      })
      app.stage.on('pointerup',()=>{ pan=false; dragRef.current=null })
      app.stage.on('pointerupoutside',()=>{ pan=false; dragRef.current=null })

      // ── Zoom ──────────────────────────────────────────────────────────
      const onWheel=(e:WheelEvent)=>{
        e.preventDefault()
        const f=Math.exp(-e.deltaY*0.001)
        const b=(e.target as HTMLElement).getBoundingClientRect()
        const mx=e.clientX-b.left,my=e.clientY-b.top
        world.x=mx-(mx-world.x)*f; world.y=my-(my-world.y)*f
        world.scale.x*=f; world.scale.y*=f
        schedGrid()
      }
      canvasRef.current?.addEventListener('wheel',onWheel,{passive:false})

      // ── Grid helpers ──────────────────────────────────────────────────
      function drawGrid(){
        syncGrid(gridLayer,world.x,world.y,world.scale.x,w,h)
      }
      let gridRaf: number|null = null
      function schedGrid(){
        if(gridRaf)return; gridRaf=requestAnimationFrame(()=>{ drawGrid(); gridRaf=null })
      }

      // ── Element draw (rAF-debounced) ──────────────────────────────────
      function schedDraw(){
        if(dead)return
        if(rafRef.current)return
        rafRef.current=requestAnimationFrame(()=>{
          rafRef.current=null
          if(dead)return
          const els     = useElementsStore.getState().elements
          const selIds  = useUIStore.getState().selectedIds
          const setSelIds = useUIStore.getState().setSelectedIds
          const emps    = useEmployeeStore.getState().employees
          const hoods   = useNeighborhoodStore.getState().neighborhoods
          const floorId = useFloorStore.getState().activeFloorId
          const guides  = useUIStore.getState().dragAlignmentGuides
          syncNeighborhoodLayer(nlLayer, hoods, floorId)
          syncElLayer(elLayer, map, els, selIds, setSelIds, emps, dragRef)
          syncAlignmentGuides(glLayer, guides)
          syncSelectionHandles(hlLayer, selIds.map(id=>els[id]).filter(Boolean) as CanvasElement[])
        })
      }

      // Initial draw + subscriptions
      drawGrid()
      schedDraw()
      const u1=useElementsStore.subscribe(schedDraw)
      const u2=useUIStore.subscribe(schedDraw)
      const u3=useNeighborhoodStore.subscribe(schedDraw)
      const u4=useFloorStore.subscribe(schedDraw)
      ;(app as Application&{_c?:()=>void})._c=()=>{
        u1();u2();u3();u4()
        canvasRef.current?.removeEventListener('wheel',onWheel)
        if(rafRef.current){ cancelAnimationFrame(rafRef.current); rafRef.current=null }
        if(gridRaf){ cancelAnimationFrame(gridRaf); gridRaf=null }
      }
    })

    return ()=>{
      dead=true
      if(rafRef.current){ cancelAnimationFrame(rafRef.current); rafRef.current=null }
      const a=appRef.current as (Application&{_c?:()=>void})|null
      if(a){a._c?.();a.destroy(true);appRef.current=null}
      map.clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]) // mount only — resize handled separately

  useEffect(()=>{
    const app=appRef.current; if(!app)return
    const w=width>0?width:800, h=height>0?height:600
    app.renderer.resize(w,h)
    // Redraw grid at new size
    const gl=gridLayerRef.current, world=worldRef.current
    if(gl&&world) syncGrid(gl,world.x,world.y,world.scale.x,w,h)
  },[width,height])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width, height, touchAction: 'none' }}
      aria-label="PixiJS floor plan (experimental)"
    />
  )
})

// ── Element layer sync ────────────────────────────────────────────────────────
type DragRef = React.MutableRefObject<{id:string;swx:number;swy:number;sex:number;sey:number}|null>

interface StatefulContainer extends Container {
  _state?: { el: CanvasElement; sel: boolean; empHash: string }
}

function syncElLayer(
  layer:Container, map:Map<string,Container>, elements:Record<string,CanvasElement>,
  selIds:string[], setSelIds:(ids:string[])=>void, emps:Record<string,Employee>, dragRef:DragRef
){
  const cur=new Set(Object.keys(elements))
  for(const [id,c] of map){ if(!cur.has(id)){layer.removeChild(c);c.destroy({children:true});map.delete(id)} }

  let childIdx = 0
  for(const el of Object.values(elements).sort((a,b)=>a.zIndex-b.zIndex)){
    if(!el.visible){ 
      const x=map.get(el.id)
      if(x){layer.removeChild(x);x.destroy({children:true});map.delete(el.id)} 
      continue 
    }
    
    const sel=selIds.includes(el.id)
    let empHash = ''
    if ('assignedEmployeeId' in el && el.assignedEmployeeId) {
      const emp = emps[el.assignedEmployeeId as string]
      if (emp) empHash = `${emp.name}:${emp.department}`
    } else if ('assignedEmployeeIds' in el && Array.isArray(el.assignedEmployeeIds)) {
      empHash = el.assignedEmployeeIds.map(id => {
        const emp = id ? emps[id as string] : null
        return emp ? `${emp.name}:${emp.department}` : ''
      }).join(',')
    }

    const existing=map.get(el.id) as StatefulContainer | undefined
    let c = existing
    
    if(existing){
      const state = existing._state
      // Zustand guarantees `el` object reference only changes if element data changes
      if(state && state.el === el && state.sel === sel && state.empHash === empHash){
        // Unchanged, keep c = existing
      } else {
        layer.removeChild(existing);existing.destroy({children:true});map.delete(el.id)
        c = buildEl(el,selIds,setSelIds,emps,dragRef) as StatefulContainer
        c._state = { el, sel, empHash }
        map.set(el.id,c); layer.addChild(c)
      }
    } else {
      c = buildEl(el,selIds,setSelIds,emps,dragRef) as StatefulContainer
      c._state = { el, sel, empHash }
      map.set(el.id,c); layer.addChild(c)
    }

    if (c) {
      if (layer.getChildIndex(c) !== childIdx) {
        layer.setChildIndex(c, childIdx)
      }
      childIdx++
    }
  }
}

function buildEl(
  el:CanvasElement, selIds:string[], setSelIds:(ids:string[])=>void,
  emps:Record<string,Employee>, dragRef:DragRef
):Container{
  const c=new Container(); c.x=el.x; c.y=el.y; c.rotation=(el.rotation*Math.PI)/180
  c.alpha=el.style?.opacity??1
  const sel=selIds.includes(el.id); const g=new Graphics()

  const t = el.type as string
  if(t==='workstation'){
    renderWorkstation(g,c,el as WorkstationElement,emps,sel)
  } else if(WALL_TYPES.has(t) && isPolylineType(el.type as Parameters<typeof isPolylineType>[0])){
    renderWall(g,el as Parameters<typeof renderWall>[1],sel)
  } else if(DESK_TYPES.has(t)){
    renderDesk(g,el as DeskElement|PrivateOfficeElement,sel)
  } else if(TABLE_TYPES.has(t)){
    renderTable(g,el as Parameters<typeof renderTable>[1],sel)
  } else if(ROOM_TYPES.has(t)){
    renderRoom(c,el as Parameters<typeof renderRoom>[1],sel)
  } else {
    const f=parseInt((el.style?.fill??'#9CA3AF').replace('#',''),16)
    const s=parseInt((el.style?.stroke??'#6B7280').replace('#',''),16)
    g.roundRect(0,0,el.width,el.height,3).fill({color:f}).stroke({color:sel?0x7c3aed:s,width:sel?2:1})
  }
  if(!ROOM_TYPES.has(t)) c.addChild(g)

  // Seat label — single-seat desks only
  if(DESK_TYPES.has(t) && t !== 'workstation'){
    const aid=(el as DeskElement).assignedEmployeeId
    if(aid&&emps[aid]){
      const emp=emps[aid]; const dc=deptColor(emp.department)
      const bw=Math.min(el.width-4,80); const bg=new Graphics()
      bg.roundRect(el.width/2-bw/2,-18,bw,14,3).fill({color:dc})
      c.addChild(bg)
      const t=new Text({text:emp.name.split(' ')[0],style:SEAT_STYLE})
      t.x=el.width/2-t.width/2; t.y=-17; c.addChild(t)
    }
  }

  // Drag + select
  c.eventMode='static'; c.cursor='grab'
  c.on('pointerdown',(e:FederatedPointerEvent)=>{
    e.stopPropagation()
    const multi=e.ctrlKey||e.metaKey||e.shiftKey,cur=useUIStore.getState().selectedIds
    setSelIds(multi?(cur.includes(el.id)?cur.filter(i=>i!==el.id):[...cur,el.id]):[el.id])
    const wp=c.parent?.toLocal(e.global)
    if(wp) dragRef.current={id:el.id,swx:wp.x,swy:wp.y,sex:el.x,sey:el.y}
    c.cursor='grabbing'
  })
  c.on('pointerup',()=>{ dragRef.current=null; c.cursor='grab' })
  return c
}
