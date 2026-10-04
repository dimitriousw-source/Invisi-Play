import bpy, math, os
from mathutils import Vector

BASE_DIR=r"C:\Users\katie\Documents\Invisi-Play\Blender\environments\sunscale-reach"
EXPORT_DIR=r"C:\Users\katie\Documents\Invisi-Play\Exports\environment"
BLEND_PATH=os.path.join(BASE_DIR,"sunscale_reach_v001.blend")
GLB_PATH=os.path.join(EXPORT_DIR,"sunscale_reach_v001.glb")
PREVIEW_PATH=os.path.join(BASE_DIR,"sunscale_reach_v001_preview.png")

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1280
scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world.color=(0.05,0.045,0.055)

env_col=bpy.data.collections.new("Sunscale_Environment")
scene.collection.children.link(env_col)
preview_col=bpy.data.collections.new("Preview_Only")
scene.collection.children.link(preview_col)

def move(obj,col):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    col.objects.link(obj)

def hexrgba(h):
    h=h.lstrip('#')
    return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))+(1,)

def mat(name,hexv,rough=0.75,emission=None,strength=0):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    b=m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value=hexrgba(hexv)
    b.inputs["Roughness"].default_value=rough
    if emission:
        if "Emission Color" in b.inputs: b.inputs["Emission Color"].default_value=hexrgba(emission)
        elif "Emission" in b.inputs: b.inputs["Emission"].default_value=hexrgba(emission)
        if "Emission Strength" in b.inputs: b.inputs["Emission Strength"].default_value=strength
    return m

M_SAND=mat("MAT_Sand","#C98A60",0.92)
M_LIGHT=mat("MAT_SunlitSand","#DCAA74",0.88)
M_DARK=mat("MAT_CanyonDark","#744938",0.9)
M_JADE=mat("MAT_Jade","#5F9D7B",0.62)
M_JADE_GLOW=mat("MAT_JadeGlow","#72B690",0.48,"#6DBE8A",1.0)
M_AMBER=mat("MAT_RelicAmber","#F2C85C",0.44,"#EFA83A",1.8)
M_RUIN=mat("MAT_Ruin","#8D725B",0.84)
M_PLANT=mat("MAT_Plant","#6F8857",0.78)
M_PLANT2=mat("MAT_Plant2","#82965F",0.8)

def smooth(o):
    if hasattr(o.data,"polygons"):
        for p in o.data.polygons: p.use_smooth=True
    return o

def cube(name,loc,scale,material,rot=(0,0,0),bevel=0.0,col=env_col):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot)
    o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel>0:
        mod=o.modifiers.new("SoftEdges",'BEVEL');mod.width=bevel;mod.segments=2
    o.data.materials.append(material);move(o,col);return o

def ico(name,loc,scale,material,sub=2,col=env_col):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    smooth(o);o.data.materials.append(material);move(o,col);return o

def cyl(name,loc,radius,depth,material,verts=10,rot=(0,0,0),col=env_col):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=loc,rotation=rot)
    o=bpy.context.object;o.name=name;smooth(o);o.data.materials.append(material);move(o,col);return o

def cone(name,loc,r1,r2,depth,material,verts=7,rot=(0,0,0),col=env_col):
    bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=depth,location=loc,rotation=rot)
    o=bpy.context.object;o.name=name;smooth(o);o.data.materials.append(material);move(o,col);return o

# Base terrain: layered basin
cube("Terrain_Base",(0,0,-0.45),(18,24,0.5),M_SAND,bevel=.25)
cube("Path_Main",(0,2,0.02),(2.6,16,0.05),M_LIGHT,bevel=.35)
cube("Arrival_Overlook",(0,-14,0.18),(5.8,3.2,0.22),M_LIGHT,bevel=.45)

# Canyon walls and hero spires
spire_specs=[
(-12,-11,4.5,2.8,8.5),(-10,-2,3.6,2.2,6.4),(-13,9,5.0,3.2,10.5),
(12,-9,4.6,2.7,9.2),(11,1,3.3,2.1,6.8),(13,11,5.5,3.4,11.5),
]
for i,(x,y,r,zrad,h) in enumerate(spire_specs):
    cone(f"CanyonSpire_{i}",(x,y,h/2-0.1),r*0.82,r*0.14,h,M_DARK,verts=7,rot=(0,0,math.radians((i*17)%40-20)))
    cone(f"CanyonSpireCap_{i}",(x,y,h*0.72),r*0.58,0.05,h*0.48,M_SAND,verts=7)

# Boulder clusters
for i,(x,y,s) in enumerate([
(-7,-12,1.4),(-6,-8,1.0),(-8,-4,1.25),(-7,4,1.6),(-6,10,1.1),
(7,-11,1.2),(8,-6,1.5),(6,0,1.1),(8,6,1.35),(7,12,1.6)
]):
    ico(f"SandstoneBoulder_{i}",(x,y,s*.45),(s*1.25,s,s*.65),M_SAND,2)

# Jade crystal garden
crystals=[
(-4,4,1.0,2.4),(-3.1,5.0,.65,1.5),(-4.8,5.4,.55,1.25),
(4,8,.9,2.0),(4.8,7.4,.55,1.35),(3.2,8.7,.5,1.15)
]
for i,(x,y,r,h) in enumerate(crystals):
    cone(f"JadeCrystal_{i}",(x,y,h/2),r,0,h,M_JADE_GLOW,verts=6,rot=(math.radians(-4+i*2),math.radians((i%2)*6),math.radians(i*13)))

# Ruin gate
for side in (-1,1):
    cyl(f"RuinPillar_{'L' if side<0 else 'R'}",(side*3.7,-1.2,2.25),0.62,4.5,M_RUIN,verts=8)
    cube(f"RuinFoot_{'L' if side<0 else 'R'}",(side*3.7,-1.2,.3),(.95,.95,.3),M_RUIN,bevel=.12)
cube("RuinLintel",(0,-1.2,4.15),(4.3,.65,.45),M_RUIN,rot=(0,0,math.radians(-2)),bevel=.12)
cube("RuinBrokenTop",(-1.6,-1.15,5.0),(1.25,.58,.35),M_RUIN,rot=(0,math.radians(7),math.radians(-9)),bevel=.1)

# Reptile totems
for i,x in enumerate((-6.2,6.2)):
    cyl(f"TotemBase_{i}",(x,1.8,.55),.75,1.1,M_RUIN,verts=8)
    cone(f"TotemHead_{i}",(x,1.8,1.75),.68,.34,1.35,M_RUIN,verts=6)
    ico(f"TotemGem_{i}",(x,1.1,1.8),(.22,.18,.32),M_AMBER,2)

# Plants / shrubs
for i,(x,y) in enumerate([
(-5,-9),(-5,-5),(-6,1),(-5.5,7),(-5,13),(5,-8),(5.5,-4),(5.5,2),(5,6),(5.8,12)
]):
    cyl(f"ShrubStem_{i}",(x,y,.32),.08,.65,M_DARK,verts=8)
    for j,ang in enumerate((-35,0,35)):
        leaf=cube(f"ShrubLeaf_{i}_{j}",(x+math.sin(math.radians(ang))*.22,y,.68+j*.04),(.1,.35,.06),M_PLANT if j%2==0 else M_PLANT2,rot=(math.radians(12),math.radians(ang),math.radians(ang)),bevel=.05)

# Shrine platform near end
cyl("Shrine_Platform",(0,14.2,.18),3.2,.36,M_RUIN,verts=48)
cyl("Shrine_Inner",(0,14.2,.39),2.25,.18,M_DARK,verts=48)
for i,ang in enumerate((0,120,240)):
    a=math.radians(ang)
    x=math.sin(a)*2.35; y=14.2+math.cos(a)*2.35
    fin=cone(f"ShrineFin_{i}",(x,y,1.9),.48,.14,3.2,M_RUIN,verts=7,rot=(math.radians(-8),0,-a))
    ico(f"ShrineFinGem_{i}",(x,y,3.2),(.23,.23,.32),M_JADE_GLOW,2)

# Floating relic core
ico("Sunscale_RelicCore",(0,14.2,2.2),(.52,.52,.72),M_AMBER,3)
# Rings
for z,rad in ((1.65,1.05),(1.45,1.45)):
    bpy.ops.mesh.primitive_torus_add(major_radius=rad,minor_radius=.08,major_segments=48,minor_segments=10,location=(0,14.2,z),rotation=(math.radians(90),0,0))
    o=bpy.context.object;o.name=f"ShrineRing_{rad}";o.data.materials.append(M_AMBER);move(o,env_col)

# Distant background mesas
for i,(x,y,sx,sy,h) in enumerate([
(-22,8,8,7,5),(20,5,7,6,4.5),(-17,24,10,5,6),(17,25,9,6,7)
]):
    cone(f"BackdropMesa_{i}",(x,y,h/2-0.4),sx*.65,sx*.35,h,M_DARK,verts=8,rot=(0,0,math.radians(i*11)))

# Preview lighting/camera
bpy.ops.object.light_add(type='SUN',location=(4,-6,10))
sun=bpy.context.object;sun.name="Preview_Sun";sun.data.energy=2.6;sun.rotation_euler=(math.radians(28),math.radians(-18),math.radians(25));move(sun,preview_col)

bpy.ops.object.light_add(type='AREA',location=(-5,-8,8))
fill=bpy.context.object;fill.name="Preview_Fill";fill.data.energy=700;fill.data.color=(0.42,0.62,0.78);fill.data.size=10;move(fill,preview_col)

bpy.ops.object.camera_add(location=(17,-23,12))
cam=bpy.context.object;cam.name="Preview_Camera";move(cam,preview_col);scene.camera=cam
cam.data.lens=48
def look_at(o,target):
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
look_at(cam,(0,4,1.6))

# Render
scene.render.filepath=PREVIEW_PATH
bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
bpy.ops.render.render(write_still=True)

# Export only env
bpy.ops.object.select_all(action='DESELECT')
for o in env_col.objects:o.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,export_format='GLB',use_selection=True,
    export_animations=False,export_materials='EXPORT',
    export_cameras=False,export_lights=False,export_yup=True,
    export_apply=False,export_extras=True
)
print("SUNSCALE_BUILD_COMPLETE")
print(BLEND_PATH)
print(GLB_PATH)
print(PREVIEW_PATH)
print("Objects:",len(env_col.objects))
