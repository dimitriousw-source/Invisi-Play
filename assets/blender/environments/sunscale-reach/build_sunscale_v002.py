import bpy, math, os, random
from mathutils import Vector

BASE_DIR=r"C:\Users\katie\Documents\Invisi-Play\Blender\environments\sunscale-reach"
EXPORT_DIR=r"C:\Users\katie\Documents\Invisi-Play\Exports\environment"
TEX_DIR=os.path.join(BASE_DIR,"textures")
os.makedirs(TEX_DIR,exist_ok=True)
os.makedirs(EXPORT_DIR,exist_ok=True)
BLEND_PATH=os.path.join(BASE_DIR,"sunscale_reach_v002.blend")
GLB_PATH=os.path.join(EXPORT_DIR,"sunscale_reach_v002.glb")
PREVIEW_PATH=os.path.join(BASE_DIR,"sunscale_reach_v002_preview.png")

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1280
scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world.color=(0.025,0.03,0.04)

env_col=bpy.data.collections.new("Sunscale_Reach_v002")
scene.collection.children.link(env_col)
preview_col=bpy.data.collections.new("Preview_Only")
scene.collection.children.link(preview_col)

def move(o,col=env_col):
    for c in list(o.users_collection): c.objects.unlink(o)
    col.objects.link(o)
def rgb(h):
    h=h.lstrip('#')
    return tuple(int(h[i:i+2],16)/255.0 for i in (0,2,4))

def tex_image(name,path,base_hex,dark_hex,light_hex,seed):
    random.seed(seed)
    w=h=256
    img=bpy.data.images.new(name,width=w,height=h,alpha=True)
    base,dark,light=rgb(base_hex),rgb(dark_hex),rgb(light_hex)
    px=[0.0]*(w*h*4)
    for y in range(h):
        ny=y/(h-1)
        for x in range(w):
            nx=x/(w-1)
            i=(y*w+x)*4
            strata=0.5+0.5*math.sin(ny*math.pi*14+math.sin(nx*math.pi*3)*0.8)
            grain=((x*23+y*41+seed*17)%113)/113
            t=max(0,min(1,0.28+0.28*strata+0.12*(grain-0.5)))
            col=tuple(dark[k]*(1-t)+light[k]*t for k in range(3))
            col=tuple(base[k]*0.55+col[k]*0.45 for k in range(3))
            px[i:i+4]=[col[0],col[1],col[2],1]
    img.pixels=px
    img.filepath_raw=path
    img.file_format='PNG'
    img.save()
    return img

sand_tex=tex_image("TEX_SunscaleSand",os.path.join(TEX_DIR,"sunscale_sand_v002.png"),"#C98963","#8D533E","#E7B17D",101)
rock_tex=tex_image("TEX_SunscaleRock",os.path.join(TEX_DIR,"sunscale_rock_v002.png"),"#8C5A47","#54362F","#B57A5D",202)
ruin_tex=tex_image("TEX_SunscaleRuin",os.path.join(TEX_DIR,"sunscale_ruin_v002.png"),"#91715A","#5C473B","#B69A78",303)
def mat(name,base_hex,rough=0.7,image=None,em=None,strength=0,coat=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    b=m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value=(*rgb(base_hex),1)
    b.inputs["Roughness"].default_value=rough
    if "Coat Weight" in b.inputs:b.inputs["Coat Weight"].default_value=coat
    if image:
        t=m.node_tree.nodes.new("ShaderNodeTexImage");t.image=image
        m.node_tree.links.new(t.outputs["Color"],b.inputs["Base Color"])
    if em:
        if "Emission Color" in b.inputs:b.inputs["Emission Color"].default_value=(*rgb(em),1)
        elif "Emission" in b.inputs:b.inputs["Emission"].default_value=(*rgb(em),1)
        if "Emission Strength" in b.inputs:b.inputs["Emission Strength"].default_value=strength
    return m

M_SAND=mat("MAT_Sand_v002","#C98963",0.9,sand_tex)
M_LIGHT=mat("MAT_SunlitSand_v002","#E1AE7B",0.86,sand_tex)
M_ROCK=mat("MAT_CanyonRock_v002","#865543",0.86,rock_tex)
M_DARK=mat("MAT_CanyonDark_v002","#54372F",0.9,rock_tex)
M_RUIN=mat("MAT_RuinStone_v002","#91715A",0.82,ruin_tex)
M_JADE=mat("MAT_Jade_v002","#5A9F7D",0.22,em="#63C293",strength=0.28,coat=0.55)
M_JADE_DARK=mat("MAT_JadeDark_v002","#315D4D",0.28,coat=0.35)
M_AMBER=mat("MAT_RelicAmber_v002","#F0C45A",0.28,em="#F2A438",strength=1.0,coat=0.4)
M_PLANT=mat("MAT_SunPlant_v002","#778B55",0.72)
M_PLANT2=mat("MAT_SunPlant2_v002","#98A665",0.68)
M_BARK=mat("MAT_DryStem_v002","#65503B",0.85)
def smooth(o):
    if hasattr(o.data,"polygons"):
        for p in o.data.polygons:p.use_smooth=True
    return o

def bevel(o,w=0.08,seg=3):
    m=o.modifiers.new("SoftBevel",'BEVEL');m.width=w;m.segments=seg
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.modifier_apply(modifier=m.name)

def cube(name,loc,scale,material,rot=(0,0,0),bw=0.08):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot)
    o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bw:bevel(o,bw,3)
    smooth(o);o.data.materials.append(material);move(o);return o

def ico(name,loc,scale,material,sub=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    smooth(o);o.data.materials.append(material);move(o);return o

def cyl(name,loc,r,depth,material,verts=12,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot)
    o=bpy.context.object;o.name=name;smooth(o);o.data.materials.append(material);move(o);return o

def cone(name,loc,r1,r2,depth,material,verts=9,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=depth,location=loc,rotation=rot)
    o=bpy.context.object;o.name=name;smooth(o);o.data.materials.append(material);move(o);return o
def terrain_mesh():
    nx,ny=49,65
    width,length=36.0,48.0
    verts=[];faces=[]
    for j in range(ny):
        y=-18.0 + length*j/(ny-1)
        for i in range(nx):
            x=-width/2 + width*i/(nx-1)
            side=abs(x)/18.0
            ridge=max(0,side-0.34)
            z=0.10*math.sin(x*0.45)+0.06*math.sin(y*0.32)
            z+=ridge*ridge*10.5
            z+=0.35*math.sin(y*0.16+abs(x)*0.25)*ridge
            if abs(x)<3.7:
                z*=0.10
            verts.append((x,y,z))
    for j in range(ny-1):
        for i in range(nx-1):
            a=j*nx+i;b=a+1;c=a+nx+1;d=a+nx
            faces.append((a,b,c,d))
    me=bpy.data.meshes.new("TerrainMesh_v002")
    me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new("Terrain_v002",me);env_col.objects.link(o)
    smooth(o);o.data.materials.append(M_SAND)
    return o

terrain=terrain_mesh()

# Curved pale traversal ribbon assembled as overlapping soft slabs
path_points=[]
for idx,y in enumerate([ -14,-11,-8,-5,-2,1,4,7,10,13,16 ]):
    x=1.0*math.sin((y+14)*0.20)+0.35*math.sin((y+14)*0.55)
    path_points.append((x,y))
    cube("PathStone_%02d"%idx,(x,y,0.06),(2.4,1.8,0.07),M_LIGHT,(0,0,math.radians(4*math.sin(idx))),0.22)
# Hero canyon masses
for i,(x,y,r,h,lean) in enumerate([
 (-13,-13,3.8,8.5,-8),(-11,-4,3.2,7.0,5),(-13,7,4.5,10.0,-4),(-12,18,4.8,11.5,6),
 (13,-11,4.2,9.0,7),(11,-1,3.2,6.8,-5),(13,9,4.6,10.8,3),(12,21,5.0,12.0,-7)
]):
    cone("Mesa_%02d"%i,(x,y,h*0.48),r,r*0.35,h,M_ROCK,9,(0,math.radians(lean),math.radians(i*8)))
    cone("MesaCap_%02d"%i,(x,y,h*0.78),r*0.72,r*0.08,h*0.42,M_LIGHT,9)

# Layered ledges along canyon walls
for i in range(14):
    side=-1 if i%2==0 else 1
    y=-14+(i//2)*5.7
    x=side*(7.5+(i%3)*0.7)
    cube("Ledge_%02d"%i,(x,y,1.0+(i%3)*0.5),(2.4,1.2,0.45),M_ROCK,(math.radians((i%2)*3),0,math.radians(side*(5+i%4))),0.16)

# Boulder families
random.seed(44)
for i in range(34):
    side=random.choice([-1,1])
    x=side*random.uniform(4.8,9.5)
    y=random.uniform(-15,21)
    s=random.uniform(0.35,1.15)
    ico("Boulder_%02d"%i,(x,y,s*0.35),(s*1.25,s,s*0.68),M_ROCK,2)
# Ruin gate framing first reveal
for side in (-1,1):
    cyl("GatePillar_"+str(side),(side*3.7,-1.4,2.3),0.58,4.6,M_RUIN,8)
    cube("GateFoot_"+str(side),(side*3.7,-1.4,0.28),(0.9,0.9,0.28),M_RUIN,(0,0,math.radians(side*3)),0.12)
    cube("GateWing_"+str(side),(side*4.35,-1.4,3.0),(0.38,0.68,1.4),M_RUIN,(0,math.radians(side*7),math.radians(side*8)),0.12)
cube("GateLintel",(0,-1.4,4.45),(4.4,0.58,0.42),M_RUIN,(0,0,math.radians(-2)),0.12)
cube("GateTopBroken",(-1.4,-1.4,5.15),(1.3,0.50,0.28),M_RUIN,(0,math.radians(8),math.radians(-8)),0.10)

# Jade crystal gardens
for cluster,(cx,cy) in enumerate([(-4.8,5.0),(4.6,9.0),(-5.5,14.0)]):
    for j in range(5):
        a=j*math.tau/5+cluster*0.4
        rr=0.45+0.15*(j%2)
        h=1.0+0.45*((j+cluster)%3)
        x=cx+math.cos(a)*(0.8+0.25*j)
        y=cy+math.sin(a)*(0.65+0.18*j)
        cone("Jade_%d_%d"%(cluster,j),(x,y,h/2),rr,0.03,h,M_JADE,6,(math.radians(-4+j),math.radians(3*j),a))
# Stylized desert flora
def plant(name,x,y,scale=1.0):
    cyl(name+"_Stem",(x,y,0.38*scale),0.07*scale,0.76*scale,M_BARK,8)
    for j,(ang,z) in enumerate([(-42,0.55),(0,0.72),(42,0.57)]):
        leaf=cube(name+"_Leaf_"+str(j),
                  (x+math.sin(math.radians(ang))*0.22*scale,y,z*scale),
                  (0.10*scale,0.38*scale,0.055*scale),
                  M_PLANT if j!=1 else M_PLANT2,
                  (math.radians(14),math.radians(ang),math.radians(ang*0.7)),0.05*scale)
for i,(x,y,s) in enumerate([
 (-5.2,-11,1),(-5.8,-6,.8),(5.4,-9,1.1),(5.6,-4,.8),
 (-5.1,1,.9),(5.0,3,1),(-5.8,8,1.05),(5.6,12,.85),
 (-5.2,17,1.1),(5.0,18,.9)
]):
    plant("SunPlant_%02d"%i,x,y,s)

# Totems
for i,(x,y) in enumerate([(-5.8,1.8),(5.8,1.8),(-6.2,12.5),(6.2,12.5)]):
    cyl("TotemBase_%d"%i,(x,y,0.62),0.70,1.24,M_RUIN,8)
    cone("TotemHead_%d"%i,(x,y,1.82),0.68,0.28,1.35,M_RUIN,7)
    ico("TotemGem_%d"%i,(x,y-0.55,1.88),(0.20,0.12,0.30),M_AMBER,2)
# Shrine clearing and architecture
cyl("Shrine_Platform",(0,18.3,0.22),3.45,0.44,M_RUIN,56)
cyl("Shrine_Inner",(0,18.3,0.48),2.45,0.18,M_DARK,56)
cyl("Shrine_Center",(0,18.3,0.65),1.18,0.18,M_RUIN,40)
for i,ang in enumerate((0,120,240)):
    a=math.radians(ang)
    x=math.sin(a)*2.55;y=18.3+math.cos(a)*2.55
    cone("ShrineFin_%d"%i,(x,y,2.25),0.52,0.12,3.75,M_RUIN,8,(math.radians(-7),0,-a))
    ico("ShrineJade_%d"%i,(x,y,3.55),(0.24,0.18,0.36),M_JADE,3)
# floating central relic
ico("Sunscale_RelicCore",(0,18.3,2.35),(0.50,0.50,0.70),M_AMBER,3)

for idx,(z,rad) in enumerate([(1.85,1.10),(1.58,1.52)]):
    bpy.ops.mesh.primitive_torus_add(major_radius=rad,minor_radius=0.075,major_segments=48,minor_segments=10,location=(0,18.3,z),rotation=(math.radians(90),0,0))
    o=bpy.context.object;o.name="ShrineRing_%d"%idx;smooth(o);o.data.materials.append(M_AMBER);move(o)

# Sun motif steps
for i in range(5):
    cube("ShrineStep_%d"%i,(0,14.8+i*0.65,0.12+i*0.015),(2.0-i*0.08,0.42,0.12),M_LIGHT,(0,0,0),0.10)
# Background silhouettes for depth
for i,(x,y,sx,h) in enumerate([
 (-23,8,8,8),(-21,24,10,10),(22,5,8,8.5),(21,24,11,11),(-17,38,14,13),(17,39,13,12)
]):
    cone("BackdropMesa_%d"%i,(x,y,h*0.46),sx,sx*0.42,h,M_DARK,8,(0,0,math.radians(i*9)))

# Preview lighting
bpy.ops.object.light_add(type='SUN',location=(4,-6,10))
sun=bpy.context.object;sun.data.energy=2.8;sun.rotation_euler=(math.radians(28),math.radians(-18),math.radians(25));move(sun,preview_col)
bpy.ops.object.light_add(type='AREA',location=(-7,-6,10))
fill=bpy.context.object;fill.data.energy=850;fill.data.size=12;fill.data.color=(0.45,0.64,0.82);move(fill,preview_col)
bpy.ops.object.light_add(type='AREA',location=(5,18,7))
shrine_fill=bpy.context.object;shrine_fill.data.energy=650;shrine_fill.data.size=6;shrine_fill.data.color=(1.0,0.60,0.25);move(shrine_fill,preview_col)

def look_at(o,t):
    o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()

bpy.ops.object.camera_add(location=(20,-28,15))
cam=bpy.context.object;cam.data.lens=50;look_at(cam,(0,5,1.8));scene.camera=cam;move(cam,preview_col)

scene.render.filepath=PREVIEW_PATH
bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
bpy.ops.render.render(write_still=True)
bpy.ops.object.select_all(action='DESELECT')
for o in env_col.objects:o.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format='GLB',
    use_selection=True,
    export_animations=False,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_yup=True,
    export_apply=False,
    export_extras=True
)
print("SUNSCALE_V002_COMPLETE")
print(BLEND_PATH)
print(GLB_PATH)
print(PREVIEW_PATH)
print("Objects:",len(env_col.objects))
