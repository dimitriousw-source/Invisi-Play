import bpy, math, os, random
from mathutils import Vector

BASE_DIR = r"C:\Users\katie\Documents\Invisi-Play\Blender\champions\shelvora"
EXPORT_DIR = r"C:\Users\katie\Documents\Invisi-Play\Exports\champions"
TEX_DIR = os.path.join(BASE_DIR, "textures")
os.makedirs(TEX_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)
BLEND_PATH = os.path.join(BASE_DIR, "shelvora_v002.blend")
GLB_PATH = os.path.join(EXPORT_DIR, "shelvora_v002.glb")
PREVIEW_PATH = os.path.join(BASE_DIR, "shelvora_v002_preview.png")

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 90
scene.world.color = (0.02, 0.028, 0.036)

champion_col = bpy.data.collections.new("Champion_Shelvora_v002")
scene.collection.children.link(champion_col)
preview_col = bpy.data.collections.new("Preview_Only")
scene.collection.children.link(preview_col)

def move(obj, col=champion_col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)
def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16)/255.0 for i in (0,2,4))

def paint_texture(name, filename, base_hex, dark_hex, light_hex, seed):
    random.seed(seed)
    w = h = 256
    img = bpy.data.images.new(name, width=w, height=h, alpha=True)
    base, dark, light = rgb(base_hex), rgb(dark_hex), rgb(light_hex)
    px = [0.0] * (w*h*4)
    for y in range(h):
        ny = y/(h-1)
        for x in range(w):
            nx = x/(w-1)
            idx = (y*w+x)*4
            wave = 0.5 + 0.5*math.sin(nx*math.pi*5.0 + math.sin(ny*math.pi*3.0))
            grain = ((x*37 + y*19 + seed*11) % 101)/101.0
            t = max(0.0, min(1.0, 0.28*(wave-0.5) + 0.10*(grain-0.5) + 0.45))
            col = tuple(dark[i]*(1-t) + light[i]*t for i in range(3))
            col = tuple(base[i]*0.62 + col[i]*0.38 for i in range(3))
            px[idx:idx+4] = [col[0], col[1], col[2], 1.0]
    img.pixels = px
    img.filepath_raw = filename
    img.file_format = 'PNG'
    img.save()
    return img

body_tex = paint_texture("TEX_Body", os.path.join(TEX_DIR,"shelvora_body_v002.png"), "#5D9E7B","#2F5D4D","#93C29C",11)
shell_tex = paint_texture("TEX_Shell", os.path.join(TEX_DIR,"shelvora_shell_v002.png"), "#355642","#1D332A","#77956B",22)
under_tex = paint_texture("TEX_Under", os.path.join(TEX_DIR,"shelvora_under_v002.png"), "#C7BA8C","#8A7B59","#E3D9AD",33)
def make_mat(name, base_hex, rough=0.55, image=None, emission=None, strength=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb(base_hex),1)
    bsdf.inputs["Roughness"].default_value = rough
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
    if image:
        tex = m.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        m.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    if emission:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (*rgb(emission),1)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (*rgb(emission),1)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = strength
    return m

MAT_BODY = make_mat("MAT_Shelvora_Body_v002","#5D9E7B",0.6,body_tex,coat=0.08)
MAT_BODY_DARK = make_mat("MAT_Shelvora_BodyDark_v002","#315C4D",0.68)
MAT_UNDER = make_mat("MAT_Shelvora_Under_v002","#C7BA8C",0.75,under_tex)
MAT_SHELL = make_mat("MAT_Shelvora_Shell_v002","#355642",0.44,shell_tex,coat=0.18)
MAT_SCUTE = make_mat("MAT_Shelvora_Scute_v002","#58765B",0.4,shell_tex,coat=0.26)
MAT_RIM = make_mat("MAT_Shelvora_Rim_v002","#20372D",0.5,coat=0.12)
MAT_GOLD = make_mat("MAT_Sunscale_Marking_v002","#EAC45D",0.28,emission="#F3A33A",strength=0.2,coat=0.4)
MAT_WHITE = make_mat("MAT_EyeWhite_v002","#F8F2DE",0.18,coat=0.75)
MAT_IRIS = make_mat("MAT_Iris_v002","#D9912F",0.22,coat=0.65)
MAT_PUPIL = make_mat("MAT_Pupil_v002","#0B1111",0.14,coat=0.8)
MAT_CLAW = make_mat("MAT_Claw_v002","#E3D2A4",0.5)
MAT_MOUTH = make_mat("MAT_Mouth_v002","#262A27",0.72)
def smooth(o):
    if hasattr(o.data,"polygons"):
        for p in o.data.polygons:
            p.use_smooth = True
    return o

def bevel(o, width=0.06, seg=3):
    mod = o.modifiers.new("SoftBevel",'BEVEL')
    mod.width = width
    mod.segments = seg
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier=mod.name)

def uv(name, loc, scale, mat, seg=40, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(o)
    o.data.materials.append(mat)
    move(o)
    return o

def ico(name, loc, scale, mat, sub=3):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=1, location=loc)
    o=bpy.context.object
    o.name=name
    o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(o)
    o.data.materials.append(mat)
    move(o)
    return o

def round_cube(name, loc, scale, mat, rot=(0,0,0), bw=0.10):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o=bpy.context.object
    o.name=name
    o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel(o,bw,4)
    smooth(o)
    o.data.materials.append(mat)
    move(o)
    return o
def cylinder(name, loc, radius, depth, mat, rot=(0,0,0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object
    o.name=name
    bevel(o,0.035,3)
    smooth(o)
    o.data.materials.append(mat)
    move(o)
    return o

def cone(name, loc, r1, r2, depth, mat, rot=(0,0,0), verts=24):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object
    o.name=name
    smooth(o)
    o.data.materials.append(mat)
    move(o)
    return o

def torus(name, loc, major, minor, mat, scale=(1,1,1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=48, minor_segments=16, location=loc)
    o=bpy.context.object
    o.name=name
    o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(o)
    o.data.materials.append(mat)
    move(o)
    return o

def curve(name, pts, depth, mat):
    cd = bpy.data.curves.new(name+"_Curve",'CURVE')
    cd.dimensions='3D'
    cd.bevel_depth=depth
    cd.bevel_resolution=3
    sp=cd.splines.new('BEZIER')
    sp.bezier_points.add(len(pts)-1)
    for bp,p in zip(sp.bezier_points,pts):
        bp.co=p
        bp.handle_left_type='AUTO'
        bp.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,cd)
    champion_col.objects.link(o)
    o.data.materials.append(mat)
    return o
# Armature
arm_data=bpy.data.armatures.new("Rig_Shelvora_v002")
arm=bpy.data.objects.new("Rig_Shelvora_v002",arm_data)
champion_col.objects.link(arm)
bpy.context.view_layer.objects.active=arm
arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

def bone(name, head, tail, parent=None):
    b=arm_data.edit_bones.new(name)
    b.head=head
    b.tail=tail
    if parent:
        b.parent=arm_data.edit_bones.get(parent)
    return b

bone("root",(0,0,0),(0,0,0.2))
bone("pelvis",(0,0,0.2),(0,0,0.58),"root")
bone("spine_01",(0,0,0.58),(0,0,0.98),"pelvis")
bone("shell_root",(0,-0.08,0.78),(0,-0.04,1.34),"spine_01")
bone("neck",(0,0.44,0.72),(0,0.93,0.92),"spine_01")
bone("head",(0,0.93,0.92),(0,1.32,1.0),"neck")
bone("tail_01",(0,-0.70,0.54),(0,-1.16,0.43),"pelvis")

for key, pts in {
 "F.L":[(-0.52,0.42,0.52),(-0.58,0.47,0.26),(-0.58,0.56,0.10),(-0.58,0.82,0.08)],
 "F.R":[(0.52,0.42,0.52),(0.58,0.47,0.26),(0.58,0.56,0.10),(0.58,0.82,0.08)],
 "B.L":[(-0.58,-0.42,0.50),(-0.65,-0.42,0.25),(-0.66,-0.30,0.10),(-0.66,-0.05,0.08)],
 "B.R":[(0.58,-0.42,0.50),(0.65,-0.42,0.25),(0.66,-0.30,0.10),(0.66,-0.05,0.08)]
}.items():
    bone("upper_leg_"+key,pts[0],pts[1],"pelvis")
    bone("lower_leg_"+key,pts[1],pts[2],"upper_leg_"+key)
    bone("foot_"+key,pts[2],pts[3],"lower_leg_"+key)

bpy.ops.object.mode_set(mode='POSE')
for pb in arm.pose.bones:
    pb.rotation_mode='XYZ'
bpy.ops.object.mode_set(mode='OBJECT')
# Body and shell
body=uv("Body_Core",(0,0,0.58),(0.72,0.92,0.46),MAT_BODY,44,26)
belly=uv("Belly_Plate",(0,0.20,0.47),(0.57,0.64,0.28),MAT_UNDER,40,22)
chest=uv("Chest",(0,0.50,0.68),(0.53,0.53,0.38),MAT_BODY,40,22)
shell=uv("Shell_Base",(0,-0.11,0.92),(1.07,1.18,0.54),MAT_SHELL,52,30)
shell_lower=uv("Shell_Lower_Rim",(0,-0.08,0.74),(1.09,1.16,0.26),MAT_RIM,48,26)
shell_ring=torus("Shell_Rim",(0,-0.10,0.91),0.87,0.11,MAT_RIM,(1.10,1.20,0.60))

scutes=[]
for name,loc,scale,rot in [
 ("Scute_Center",(0,-0.12,1.39),(0.47,0.52,0.09),(0,0,0)),
 ("Scute_Front",(0,0.49,1.25),(0.45,0.35,0.08),(math.radians(8),0,0)),
 ("Scute_Back",(0,-0.73,1.20),(0.45,0.37,0.08),(math.radians(-9),0,0)),
 ("Scute_LF",(-0.55,0.24,1.18),(0.33,0.41,0.072),(math.radians(6),math.radians(-7),math.radians(-10))),
 ("Scute_RF",(0.55,0.24,1.18),(0.33,0.41,0.072),(math.radians(6),math.radians(7),math.radians(10))),
 ("Scute_LB",(-0.56,-0.47,1.12),(0.33,0.39,0.070),(math.radians(-6),math.radians(-7),math.radians(8))),
 ("Scute_RB",(0.56,-0.47,1.12),(0.33,0.39,0.070),(math.radians(-6),math.radians(7),math.radians(-8)))
]:
    scutes.append(round_cube(name,loc,scale,MAT_SCUTE,rot,0.13))

sun_core=ico("Sunscale_Core",(0,-0.13,1.53),(0.15,0.19,0.07),MAT_GOLD,3)
sun_nodes=[]
for i,(x,y,z) in enumerate([(-0.48,0.31,1.32),(0.48,0.31,1.32),(-0.50,-0.43,1.24),(0.50,-0.43,1.24)]):
    sun_nodes.append(ico("Sunscale_Node_"+str(i),(x,y,z),(0.055,0.070,0.033),MAT_GOLD,2))
# Head and face
neck=cylinder("Neck",(0,0.79,0.78),0.27,0.62,MAT_BODY,(math.radians(73),0,0),28)
head=uv("Head",(0,1.17,0.92),(0.48,0.52,0.43),MAT_BODY,46,26)
brow=uv("Brow_Ridge",(0,1.35,1.08),(0.40,0.19,0.12),MAT_BODY_DARK,36,20)
muzzle=uv("Muzzle",(0,1.57,0.80),(0.35,0.24,0.22),MAT_UNDER,36,20)
jaw=uv("Lower_Jaw",(0,1.50,0.69),(0.31,0.23,0.12),MAT_BODY_DARK,30,18)

nostrils=[]
for side,x in [("L",-0.11),("R",0.11)]:
    nostrils.append(uv("Nostril_"+side,(x,1.775,0.825),(0.034,0.020,0.023),MAT_MOUTH,16,10))

eye_parts=[]
for side,x in [("L",-0.245),("R",0.245)]:
    eye_parts.append(uv("Eye_"+side,(x,1.46,1.01),(0.145,0.105,0.155),MAT_WHITE,30,18))
    eye_parts.append(uv("Iris_"+side,(x,1.553,1.01),(0.082,0.031,0.092),MAT_IRIS,24,14))
    eye_parts.append(uv("Pupil_"+side,(x,1.579,1.01),(0.038,0.017,0.052),MAT_PUPIL,18,12))
    eye_parts.append(uv("Glint_"+side,(x-0.022,1.591,1.047),(0.014,0.009,0.017),MAT_WHITE,12,8))
    eye_parts.append(round_cube("UpperLid_"+side,(x,1.485,1.115),(0.16,0.052,0.042),MAT_BODY_DARK,(math.radians(-5),0,math.radians(-7 if side=="L" else 7)),0.035))

cheek_l=uv("CheekMark_L",(-0.36,1.42,0.80),(0.073,0.034,0.11),MAT_GOLD,20,12)
cheek_r=uv("CheekMark_R",(0.36,1.42,0.80),(0.073,0.034,0.11),MAT_GOLD,20,12)
mouth=curve("Mouth_Line",[(-0.20,1.718,0.72),(0,1.744,0.702),(0.20,1.718,0.72)],0.016,MAT_MOUTH)
tail=cone("Tail",(0,-1.04,0.48),0.22,0.05,0.68,MAT_BODY,(math.radians(75),0,0),28)
# Legs, feet, claws
leg_parts={}
for key,(x,y,front) in {
 "F.L":(-0.56,0.43,True),"F.R":(0.56,0.43,True),
 "B.L":(-0.62,-0.43,False),"B.R":(0.62,-0.43,False)
}.items():
    upper=uv("UpperLeg_"+key,(x,y,0.39),(0.29,0.31,0.32),MAT_BODY,32,18)
    lower_y=y+(0.07 if front else 0.09)
    lower=cylinder("LowerLeg_"+key,(x,lower_y,0.22),0.14,0.34,MAT_BODY_DARK,(0,0,0),24)
    foot_y=y+(0.27 if front else 0.25)
    foot=round_cube("Foot_"+key,(x,foot_y,0.10),(0.29,0.36,0.11),MAT_UNDER,(0,0,0),0.10)
    claws=[]
    for t,dx in enumerate((-0.13,0,0.13)):
        claws.append(cone("Claw_"+key+"_"+str(t),(x+dx,foot_y+0.31,0.085),0.048,0.009,0.19,MAT_CLAW,(math.radians(90),0,0),16))
    leg_parts[key]=(upper,lower,foot,claws)

def parent_bone(obj,bn):
    mw=obj.matrix_world.copy()
    obj.parent=arm
    obj.parent_type='BONE'
    obj.parent_bone=bn
    obj.matrix_world=mw

for o in [body,belly,chest]:
    parent_bone(o,"spine_01")
for o in [shell,shell_lower,shell_ring,sun_core]+scutes+sun_nodes:
    parent_bone(o,"shell_root")
parent_bone(neck,"neck")
for o in [head,brow,muzzle,jaw,cheek_l,cheek_r,mouth]+nostrils+eye_parts:
    parent_bone(o,"head")
parent_bone(tail,"tail_01")
for key,(upper,lower,foot,claws) in leg_parts.items():
    parent_bone(upper,"upper_leg_"+key)
    parent_bone(lower,"lower_leg_"+key)
    parent_bone(foot,"foot_"+key)
    for claw in claws:
        parent_bone(claw,"foot_"+key)
# Animation helpers
arm.animation_data_create()

def reset_pose():
    for pb in arm.pose.bones:
        pb.rotation_euler=(0,0,0)
        pb.location=(0,0,0)
        pb.scale=(1,1,1)

def key(bn,f,rot=None,loc=None):
    pb=arm.pose.bones[bn]
    if rot is not None:
        pb.rotation_euler=rot
        pb.keyframe_insert("rotation_euler",frame=f,group=bn)
    if loc is not None:
        pb.location=loc
        pb.keyframe_insert("location",frame=f,group=bn)

def action(name,end):
    reset_pose()
    a=bpy.data.actions.new(name)
    arm.animation_data.action=a
    scene.frame_start=1
    scene.frame_end=end
    return a

def neutral(f):
    for pb in arm.pose.bones:
        key(pb.name,f,(0,0,0),(0,0,0))

action("Idle",90)
neutral(1); neutral(90)
for f,z,rz,rx in [(18,0.018,4,-1),(36,0.034,-2,1),(54,0.012,-5,-1),(72,0.028,3,1)]:
    key("spine_01",f,(math.radians(1.1),0,0),(0,0,z))
    key("shell_root",f,(math.radians(-0.7),0,math.radians(1 if f in (18,72) else -1)))
    key("head",f,(math.radians(rx),0,math.radians(rz)))
action("Walk",28)
walk_frames=[1,4,8,11,15,18,22,25,28]
for f in walk_frames:
    p=(f-1)/27*math.tau
    key("spine_01",f,(math.radians(2*math.sin(p)),0,math.radians(1.3*math.sin(p))),(0,0,0.028*(0.5+0.5*math.cos(p*2))))
    key("shell_root",f,(math.radians(-1.2*math.sin(p)),0,math.radians(-3*math.sin(p))))
    key("head",f,(math.radians(-1.3*math.sin(p)),0,math.radians(1.7*math.sin(p))))
for k,off in [("F.L",0),("B.R",0),("F.R",math.pi),("B.L",math.pi)]:
    for f in walk_frames:
        t=(f-1)/27*math.tau+off
        s=math.sin(t); lift=max(0,math.sin(t))
        key("upper_leg_"+k,f,(math.radians(22*s),0,0))
        key("lower_leg_"+k,f,(math.radians(-13*s+8*lift),0,0))
        key("foot_"+k,f,(math.radians(-10*s-8*lift),0,0),(0,0,0.065*lift))

action("Run",18)
run_frames=[1,4,7,10,13,16,18]
for f in run_frames:
    p=(f-1)/17*math.tau
    key("spine_01",f,(math.radians(7),0,math.radians(2.4*math.sin(p))),(0,0,0.055*(0.5+0.5*math.cos(p*2))))
    key("shell_root",f,(math.radians(-3.2),0,math.radians(-5*math.sin(p))))
    key("head",f,(math.radians(-4),0,math.radians(2*math.sin(p))))
for k,off in [("F.L",0),("B.R",0),("F.R",math.pi),("B.L",math.pi)]:
    for f in run_frames:
        t=(f-1)/17*math.tau+off
        s=math.sin(t); lift=max(0,math.sin(t))
        key("upper_leg_"+k,f,(math.radians(35*s),0,0))
        key("lower_leg_"+k,f,(math.radians(-18*s+14*lift),0,0))
        key("foot_"+k,f,(math.radians(-14*s-12*lift),0,0),(0,0,0.10*lift))
for name,sgn in [("TurnLeft",1),("TurnRight",-1)]:
    action(name,18)
    neutral(1)
    key("head",5,(0,0,math.radians(18*sgn)))
    key("neck",7,(0,0,math.radians(10*sgn)))
    key("spine_01",9,(0,0,math.radians(7*sgn)))
    key("shell_root",9,(0,0,math.radians(-4*sgn)))
    neutral(18)

action("JumpStart",12)
neutral(1)
key("spine_01",6,(math.radians(9),0,0),(0,0,-0.07))
key("shell_root",6,(math.radians(-5),0,0))
key("head",6,(math.radians(6),0,0))
for k in ["F.L","F.R","B.L","B.R"]:
    key("upper_leg_"+k,6,(math.radians(23),0,0))
    key("lower_leg_"+k,6,(math.radians(-18),0,0))
key("spine_01",12,(math.radians(-8),0,0),(0,0,0.07))

action("JumpLoop",12)
for f in [1,6,12]:
    key("spine_01",f,(math.radians(-6),0,0),(0,0,0.045))
    key("shell_root",f,(math.radians(2),0,0))
    key("head",f,(math.radians(-3),0,0))
for k in ["F.L","F.R","B.L","B.R"]:
    for f in [1,12]:
        key("upper_leg_"+k,f,(math.radians(18),0,0))
        key("lower_leg_"+k,f,(math.radians(-14),0,0))
action("Land",14)
neutral(1)
key("spine_01",5,(math.radians(10),0,0),(0,0,-0.08))
key("shell_root",5,(math.radians(-4),0,0))
for k in ["F.L","F.R","B.L","B.R"]:
    key("upper_leg_"+k,5,(math.radians(25),0,0))
key("spine_01",9,(math.radians(3),0,0),(0,0,-0.02))
neutral(14)

action("GuardIn",12)
neutral(1)
key("spine_01",12,(math.radians(6),0,0),(0,0,-0.12))
key("head",12,(math.radians(11),0,0),(0,-0.13,-0.07))
key("shell_root",12,(math.radians(-5),0,0))
for k in ["F.L","F.R","B.L","B.R"]:
    key("upper_leg_"+k,12,(math.radians(22),0,0))

action("GuardHold",45)
for f,z in [(1,0),(22,0.012),(45,0)]:
    key("spine_01",f,(math.radians(6),0,0),(0,0,-0.12+z))
    key("head",f,(math.radians(11),0,0),(0,-0.13,-0.07))
    key("shell_root",f,(math.radians(-5),0,0))
    for k in ["F.L","F.R","B.L","B.R"]:
        key("upper_leg_"+k,f,(math.radians(22),0,0))

action("GuardOut",12)
key("spine_01",1,(math.radians(6),0,0),(0,0,-0.12))
key("head",1,(math.radians(11),0,0),(0,-0.13,-0.07))
key("shell_root",1,(math.radians(-5),0,0))
neutral(12)
action("Interact",30)
neutral(1)
key("head",9,(math.radians(-11),0,0))
key("neck",9,(math.radians(-5),0,0))
key("spine_01",16,(math.radians(-4),0,0),(0,0,0.045))
key("head",16,(math.radians(-3),0,0))
neutral(30)

action("RelicBond",75)
neutral(1)
key("head",14,(math.radians(-12),0,0))
key("spine_01",26,(math.radians(-5),0,0),(0,0,0.08))
key("shell_root",26,(math.radians(-7),0,0))
for k in ["F.L","F.R","B.L","B.R"]:
    key("upper_leg_"+k,26,(math.radians(16),0,0))
key("head",41,(math.radians(9),0,0))
key("shell_root",41,(math.radians(6),0,0))
key("spine_01",56,(math.radians(-2),0,0),(0,0,0.05))
neutral(75)

arm.animation_data.action=bpy.data.actions.get("Idle")
scene.frame_start=1; scene.frame_end=90; scene.frame_set(1)
# Preview set
MAT_GROUND=make_mat("MAT_PreviewGround","#B87956",0.9)
MAT_STONE=make_mat("MAT_PreviewStone","#6D5144",0.82)
bpy.ops.mesh.primitive_plane_add(size=18,location=(0,0,-0.01))
ground=bpy.context.object
ground.data.materials.append(MAT_GROUND)
move(ground,preview_col)
for i,(x,y,s) in enumerate([(-3,1.4,1.2),(3,-0.7,0.95),(-2.4,-2.3,0.7),(2.5,2.3,0.7)]):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=s,location=(x,y,s*0.35))
    rock=bpy.context.object
    rock.scale.z=0.55
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    smooth(rock)
    rock.data.materials.append(MAT_STONE)
    move(rock,preview_col)

bpy.ops.object.light_add(type='AREA',location=(4.5,5.5,7.0))
keylight=bpy.context.object
keylight.data.energy=1150
keylight.data.size=5.0
keylight.data.color=(1.0,0.73,0.48)
move(keylight,preview_col)

bpy.ops.object.light_add(type='AREA',location=(-4.0,2.5,4.5))
fill=bpy.context.object
fill.data.energy=700
fill.data.size=4.5
fill.data.color=(0.45,0.68,0.85)
move(fill,preview_col)

bpy.ops.object.light_add(type='AREA',location=(0,-4.5,3.5))
rim=bpy.context.object
rim.data.energy=850
rim.data.size=3.5
rim.data.color=(0.95,0.55,0.28)
move(rim,preview_col)
def look_at(obj,target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

bpy.ops.object.camera_add(location=(4.8,7.2,3.0))
cam=bpy.context.object
cam.data.lens=58
look_at(cam,(0,0.35,0.78))
scene.camera=cam
move(cam,preview_col)

scene.render.filepath=PREVIEW_PATH
bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
bpy.ops.render.render(write_still=True)

bpy.ops.object.select_all(action='DESELECT')
for o in champion_col.objects:
    o.select_set(True)
bpy.context.view_layer.objects.active=arm

bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_skins=True,
    export_def_bones=True,
    export_yup=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_extras=True,
    export_force_sampling=True,
    export_optimize_animation_size=True
)

print("SHELVORA_V002_COMPLETE")
print(BLEND_PATH)
print(GLB_PATH)
print(PREVIEW_PATH)
print("Actions:", sorted(a.name for a in bpy.data.actions))
