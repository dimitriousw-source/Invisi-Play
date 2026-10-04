import bpy
import math
import os
from mathutils import Vector

BASE_DIR = r"C:\Users\katie\Documents\Invisi-Play\Blender\champions\shelvora"
EXPORT_DIR = r"C:\Users\katie\Documents\Invisi-Play\Exports\champions"
BLEND_PATH = os.path.join(BASE_DIR, "shelvora_v001.blend")
GLB_PATH = os.path.join(EXPORT_DIR, "shelvora_v001.glb")
PREVIEW_PATH = os.path.join(BASE_DIR, "shelvora_v001_preview.png")

# -----------------------------
# Scene reset
# -----------------------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.armatures, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
    pass

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = PREVIEW_PATH
scene.render.film_transparent = False
scene.world.color = (0.035, 0.045, 0.055)

scene.frame_start = 1
scene.frame_end = 90
scene.render.fps = 30

# -----------------------------
# Collections
# -----------------------------
champion_col = bpy.data.collections.new("Champion_Shelvora")
scene.collection.children.link(champion_col)
preview_col = bpy.data.collections.new("Preview_Only")
scene.collection.children.link(preview_col)

def move_to_collection(obj, col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)

# -----------------------------
# Material helpers
# -----------------------------
def hex_to_rgba(hex_value):
    h = hex_value.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)) + (1.0,)

def make_material(name, base_hex, roughness=0.55, metallic=0.0, emission_hex=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = hex_to_rgba(base_hex)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission_hex:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = hex_to_rgba(emission_hex)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = hex_to_rgba(emission_hex)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

MAT_BODY = make_material("MAT_Shelvora_Body", "#5D9B74", 0.68)
MAT_BODY_LIGHT = make_material("MAT_Shelvora_Underside", "#B7B07B", 0.72)
MAT_SHELL = make_material("MAT_Shelvora_Shell", "#334F3D", 0.58)
MAT_SHELL_PLATE = make_material("MAT_Shelvora_ShellPlate", "#557A55", 0.52)
MAT_GOLD = make_material("MAT_Sunscale_Marking", "#E9C65E", 0.4, metallic=0.05, emission_hex="#E9A83F", emission_strength=0.35)
MAT_EYE_WHITE = make_material("MAT_Eye_White", "#F4F2DC", 0.35)
MAT_IRIS = make_material("MAT_Eye_Iris", "#D49B3B", 0.3)
MAT_PUPIL = make_material("MAT_Eye_Pupil", "#111516", 0.35)
MAT_ROCK = make_material("MAT_Preview_Rock", "#8B5D45", 0.8)
MAT_SAND = make_material("MAT_Preview_Sand", "#C98A60", 0.9)

# -----------------------------
# Mesh helpers
# -----------------------------
def smooth(obj):
    if hasattr(obj.data, "polygons"):
        for p in obj.data.polygons:
            p.use_smooth = True
    return obj

def add_uv_sphere(name, loc, scale, mat, segments=32, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    move_to_collection(obj, champion_col)
    return obj

def add_cylinder(name, loc, radius, depth, mat, rot=(0,0,0), vertices=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    move_to_collection(obj, champion_col)
    return obj

def add_torus(name, loc, major_radius, minor_radius, mat, scale=(1,1,1), rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=32,
        minor_segments=12,
        location=loc,
        rotation=rot
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    move_to_collection(obj, champion_col)
    return obj

def add_cone(name, loc, radius1, radius2, depth, mat, rot=(0,0,0), vertices=20):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius1, radius2=radius2, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    move_to_collection(obj, champion_col)
    return obj

# -----------------------------
# Armature
# -----------------------------
arm_data = bpy.data.armatures.new("Rig_Shelvora")
arm = bpy.data.objects.new("Rig_Shelvora", arm_data)
champion_col.objects.link(arm)
bpy.context.view_layer.objects.active = arm
arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

bones = {}
def ebone(name, head, tail, parent=None):
    b = arm_data.edit_bones.new(name)
    b.head = head
    b.tail = tail
    if parent:
        b.parent = arm_data.edit_bones.get(parent)
    bones[name] = b
    return b

ebone("root", (0,0,0), (0,0,0.25))
ebone("body", (0,0,0.25), (0,0,0.95), "root")
ebone("shell_root", (0,-0.08,0.63), (0,0.0,1.25), "body")
ebone("neck", (0,0.48,0.66), (0,0.98,0.88), "body")
ebone("head", (0,0.98,0.88), (0,1.28,0.95), "neck")
ebone("tail", (0,-0.58,0.55), (0,-1.05,0.46), "body")

leg_defs = {
    "leg_F.L": ((-0.52,0.48,0.52),(-0.58,0.48,0.16)),
    "leg_F.R": ((0.52,0.48,0.52),(0.58,0.48,0.16)),
    "leg_B.L": ((-0.55,-0.43,0.50),(-0.62,-0.43,0.15)),
    "leg_B.R": ((0.55,-0.43,0.50),(0.62,-0.43,0.15)),
}
for name,(head,tail) in leg_defs.items():
    ebone(name, head, tail, "body")
    foot_name = name.replace("leg_", "foot_")
    foot_head = tail
    foot_tail = (tail[0], tail[1] + 0.28, 0.09)
    ebone(foot_name, foot_head, foot_tail, name)

bpy.ops.object.mode_set(mode='POSE')
for pb in arm.pose.bones:
    pb.rotation_mode = 'XYZ'
bpy.ops.object.mode_set(mode='OBJECT')

# -----------------------------
# Model
# -----------------------------
body = add_uv_sphere("Body", (0,0.02,0.58), (0.72,0.88,0.48), MAT_BODY)
chest = add_uv_sphere("Chest", (0,0.48,0.70), (0.58,0.58,0.45), MAT_BODY_LIGHT)
shell = add_uv_sphere("Shell_Base", (0,-0.10,0.86), (1.12,1.18,0.55), MAT_SHELL, segments=40, rings=24)

# Shell top plates for richer silhouette
plate_specs = [
    ("ShellPlate_Center", (0,-0.10,1.20), (0.58,0.60,0.16)),
    ("ShellPlate_Front", (0,0.43,1.08), (0.58,0.45,0.14)),
    ("ShellPlate_Back", (0,-0.62,1.04), (0.58,0.44,0.14)),
    ("ShellPlate_Left", (-0.55,-0.08,1.04), (0.40,0.55,0.13)),
    ("ShellPlate_Right", (0.55,-0.08,1.04), (0.40,0.55,0.13)),
]
plates=[]
for name,loc,scale in plate_specs:
    plates.append(add_uv_sphere(name, loc, scale, MAT_SHELL_PLATE, segments=28, rings=14))

# Golden relic-ready shell seam/gem
shell_gem = add_uv_sphere("Sunscale_Core", (0,-0.08,1.38), (0.18,0.22,0.09), MAT_GOLD, segments=24, rings=12)
mark_left = add_uv_sphere("Sunscale_Mark_L", (-0.43,0.36,1.14), (0.12,0.22,0.055), MAT_GOLD, segments=20, rings=10)
mark_right = add_uv_sphere("Sunscale_Mark_R", (0.43,0.36,1.14), (0.12,0.22,0.055), MAT_GOLD, segments=20, rings=10)

# Head / snout
head = add_uv_sphere("Head", (0,1.02,0.83), (0.48,0.55,0.43), MAT_BODY, segments=32, rings=18)
muzzle = add_uv_sphere("Muzzle", (0,1.47,0.76), (0.34,0.25,0.22), MAT_BODY_LIGHT, segments=28, rings=14)
nose = add_uv_sphere("Nose", (0,1.68,0.78), (0.18,0.12,0.12), MAT_SHELL, segments=20, rings=10)

# Eyes
eye_z = 0.98
for side, x in (("L",-0.24),("R",0.24)):
    eye = add_uv_sphere(f"Eye_{side}", (x,1.37,eye_z), (0.15,0.12,0.16), MAT_EYE_WHITE, segments=24, rings=12)
    iris = add_uv_sphere(f"Iris_{side}", (x,1.475,eye_z), (0.082,0.035,0.09), MAT_IRIS, segments=20, rings=10)
    pupil = add_uv_sphere(f"Pupil_{side}", (x,1.508,eye_z), (0.040,0.022,0.050), MAT_PUPIL, segments=18, rings=8)

# Cheek markings
cheek_l = add_uv_sphere("CheekMark_L", (-0.34,1.34,0.72), (0.08,0.04,0.12), MAT_GOLD, segments=16, rings=8)
cheek_r = add_uv_sphere("CheekMark_R", (0.34,1.34,0.72), (0.08,0.04,0.12), MAT_GOLD, segments=16, rings=8)

# Legs and feet
leg_parts = {}
for key,(x,y) in {
    "F.L":(-0.56,0.48),
    "F.R":(0.56,0.48),
    "B.L":(-0.60,-0.42),
    "B.R":(0.60,-0.42),
}.items():
    upper = add_uv_sphere(f"UpperLeg_{key}", (x,y,0.36), (0.28,0.30,0.32), MAT_BODY, segments=24, rings=12)
    lower = add_cylinder(f"LowerLeg_{key}", (x,y+0.02,0.20), 0.16, 0.34, MAT_BODY_LIGHT)
    foot = add_uv_sphere(f"Foot_{key}", (x,y+0.18,0.08), (0.30,0.38,0.13), MAT_BODY_LIGHT, segments=24, rings=12)
    leg_parts[key]=(upper,lower,foot)

tail = add_cone("Tail", (0,-1.03,0.52), 0.22, 0.06, 0.62, MAT_BODY, rot=(math.radians(74),0,0))

# small toe pads for grounding
for key,(x,y) in {
    "F.L":(-0.56,0.67),
    "F.R":(0.56,0.67),
    "B.L":(-0.60,-0.23),
    "B.R":(0.60,-0.23),
}.items():
    add_uv_sphere(f"ToePad_{key}", (x,y,0.055), (0.31,0.28,0.055), MAT_BODY_LIGHT, segments=18, rings=8)

# -----------------------------
# Parenting to bones, preserving world transform
# -----------------------------
def parent_bone(obj, bone_name):
    world = obj.matrix_world.copy()
    obj.parent = arm
    obj.parent_type = 'BONE'
    obj.parent_bone = bone_name
    obj.matrix_world = world

for obj in [body, chest]:
    parent_bone(obj, "body")
for obj in [shell, shell_gem, mark_left, mark_right] + plates:
    parent_bone(obj, "shell_root")
for obj in [head, muzzle, nose, cheek_l, cheek_r] + [bpy.data.objects[n] for n in ["Eye_L","Eye_R","Iris_L","Iris_R","Pupil_L","Pupil_R"]]:
    parent_bone(obj, "head")
parent_bone(tail, "tail")

for key,(upper,lower,foot) in leg_parts.items():
    parent_bone(upper, f"leg_{key}")
    parent_bone(lower, f"leg_{key}")
    parent_bone(foot, f"foot_{key}")
    parent_bone(bpy.data.objects[f"ToePad_{key}"], f"foot_{key}")

# -----------------------------
# Animation helpers
# -----------------------------
arm.animation_data_create()

def reset_pose():
    for pb in arm.pose.bones:
        pb.rotation_mode='XYZ'
        pb.rotation_euler=(0,0,0)
        pb.location=(0,0,0)
        pb.scale=(1,1,1)

def key_bone(bone_name, frame, rot=None, loc=None, scale=None):
    pb = arm.pose.bones[bone_name]
    if rot is not None:
        pb.rotation_euler = rot
        pb.keyframe_insert(data_path="rotation_euler", frame=frame, group=bone_name)
    if loc is not None:
        pb.location = loc
        pb.keyframe_insert(data_path="location", frame=frame, group=bone_name)
    if scale is not None:
        pb.scale = scale
        pb.keyframe_insert(data_path="scale", frame=frame, group=bone_name)

def start_action(name, frame_end):
    reset_pose()
    action = bpy.data.actions.new(name)
    arm.animation_data.action = action
    scene.frame_start=1
    scene.frame_end=frame_end
    return action

def loop_key_defaults(frame_start, frame_end):
    for b in ["body","shell_root","neck","head","leg_F.L","leg_F.R","leg_B.L","leg_B.R","foot_F.L","foot_F.R","foot_B.L","foot_B.R"]:
        key_bone(b, frame_start, rot=(0,0,0), loc=(0,0,0))
        key_bone(b, frame_end, rot=(0,0,0), loc=(0,0,0))

# Idle
start_action("Idle", 90)
loop_key_defaults(1,90)
key_bone("body", 23, loc=(0,0,0.025), rot=(math.radians(1.5),0,0))
key_bone("body", 46, loc=(0,0,0.0), rot=(math.radians(-1),0,0))
key_bone("body", 68, loc=(0,0,0.018), rot=(math.radians(1),0,0))
key_bone("head", 30, rot=(math.radians(-2),0,math.radians(7)))
key_bone("head", 60, rot=(math.radians(2),0,math.radians(-5)))
key_bone("shell_root", 45, rot=(math.radians(1.2),0,math.radians(1.2)))

# Walk
start_action("Walk", 30)
for f in [1,8,16,23,30]:
    phase = (f-1)/29.0 * math.tau
    key_bone("body", f, loc=(0,0,0.025*math.sin(phase*2)), rot=(math.radians(2.0*math.sin(phase)),0,0))
    key_bone("shell_root", f, rot=(0,0,math.radians(3.2*math.sin(phase))))
    key_bone("head", f, rot=(math.radians(-1.8*math.sin(phase)),0,math.radians(-1.5*math.sin(phase))))
for bone, phase in [("leg_F.L",0),("leg_B.R",0),("leg_F.R",math.pi),("leg_B.L",math.pi)]:
    for f in [1,8,16,23,30]:
        t=(f-1)/29.0*math.tau+phase
        key_bone(bone,f,rot=(math.radians(24*math.sin(t)),0,0))
        foot=bone.replace("leg_","foot_")
        key_bone(foot,f,rot=(math.radians(-12*math.sin(t)),0,0))

# Run
start_action("Run", 20)
for f in [1,5,10,15,20]:
    phase=(f-1)/19.0*math.tau
    key_bone("body",f,loc=(0,0,0.05*math.sin(phase*2)),rot=(math.radians(8),0,0))
    key_bone("shell_root",f,rot=(math.radians(-3),0,math.radians(5*math.sin(phase))))
    key_bone("head",f,rot=(math.radians(-5),0,math.radians(-2*math.sin(phase))))
for bone, phase in [("leg_F.L",0),("leg_B.R",0),("leg_F.R",math.pi),("leg_B.L",math.pi)]:
    for f in [1,5,10,15,20]:
        t=(f-1)/19.0*math.tau+phase
        key_bone(bone,f,rot=(math.radians(38*math.sin(t)),0,0))
        foot=bone.replace("leg_","foot_")
        key_bone(foot,f,rot=(math.radians(-22*math.sin(t)),0,0))

# Turns
for name, sign in [("TurnLeft",1),("TurnRight",-1)]:
    start_action(name,18)
    key_bone("body",1,rot=(0,0,0)); key_bone("body",9,rot=(0,0,math.radians(8*sign))); key_bone("body",18,rot=(0,0,0))
    key_bone("head",1,rot=(0,0,0)); key_bone("head",6,rot=(0,0,math.radians(18*sign))); key_bone("head",18,rot=(0,0,math.radians(4*sign)))
    for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
        side = 1 if ".L" in b else -1
        key_bone(b,1,rot=(0,0,0))
        key_bone(b,9,rot=(math.radians(8*side*sign),0,math.radians(5*side*sign)))
        key_bone(b,18,rot=(0,0,0))

# JumpStart
start_action("JumpStart",12)
for f,z,tilt in [(1,0,0),(6,-0.07,8),(12,0.05,-8)]:
    key_bone("body",f,loc=(0,0,z),rot=(math.radians(tilt),0,0))
    key_bone("shell_root",f,rot=(math.radians(-tilt*0.45),0,0))
for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
    key_bone(b,1,rot=(0,0,0)); key_bone(b,6,rot=(math.radians(28),0,0)); key_bone(b,12,rot=(math.radians(-18),0,0))

# JumpLoop
start_action("JumpLoop",12)
for f in [1,6,12]:
    key_bone("body",f,rot=(math.radians(-6),0,0),loc=(0,0,0.03))
for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
    key_bone(b,1,rot=(math.radians(18),0,0)); key_bone(b,12,rot=(math.radians(18),0,0))
for b in ["foot_F.L","foot_F.R","foot_B.L","foot_B.R"]:
    key_bone(b,1,rot=(math.radians(-12),0,0)); key_bone(b,12,rot=(math.radians(-12),0,0))

# Land
start_action("Land",14)
for f,z,tilt in [(1,0.03,-6),(5,-0.08,10),(9,-0.02,3),(14,0,0)]:
    key_bone("body",f,loc=(0,0,z),rot=(math.radians(tilt),0,0))
    key_bone("shell_root",f,rot=(math.radians(-tilt*0.35),0,0))
for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
    key_bone(b,1,rot=(math.radians(-12),0,0)); key_bone(b,5,rot=(math.radians(26),0,0)); key_bone(b,14,rot=(0,0,0))

# GuardIn / Hold / Out
start_action("GuardIn",12)
for f,amt in [(1,0),(12,1)]:
    key_bone("body",f,loc=(0,0,-0.12*amt),rot=(math.radians(6*amt),0,0))
    key_bone("head",f,loc=(0,-0.16*amt,-0.08*amt),rot=(math.radians(12*amt),0,0))
    key_bone("shell_root",f,rot=(math.radians(-5*amt),0,0))
    for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
        key_bone(b,f,rot=(math.radians(22*amt),0,0))

start_action("GuardHold",45)
for f in [1,22,45]:
    breath = 0.012 if f==22 else 0
    key_bone("body",f,loc=(0,0,-0.12+breath),rot=(math.radians(6),0,0))
    key_bone("head",f,loc=(0,-0.16,-0.08),rot=(math.radians(12),0,0))
    key_bone("shell_root",f,rot=(math.radians(-5),0,0))
    for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
        key_bone(b,f,rot=(math.radians(22),0,0))

start_action("GuardOut",12)
for f,amt in [(1,1),(12,0)]:
    key_bone("body",f,loc=(0,0,-0.12*amt),rot=(math.radians(6*amt),0,0))
    key_bone("head",f,loc=(0,-0.16*amt,-0.08*amt),rot=(math.radians(12*amt),0,0))
    key_bone("shell_root",f,rot=(math.radians(-5*amt),0,0))
    for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
        key_bone(b,f,rot=(math.radians(22*amt),0,0))

# Interact
start_action("Interact",30)
for f,head_x,body_z in [(1,0,0),(10,-12,0.02),(18,-4,0.045),(30,0,0)]:
    key_bone("head",f,rot=(math.radians(head_x),0,0))
    key_bone("body",f,loc=(0,0,body_z),rot=(math.radians(-3 if f in (10,18) else 0),0,0))
key_bone("shell_root",10,rot=(math.radians(3),0,0)); key_bone("shell_root",30,rot=(0,0,0))

# RelicBond
start_action("RelicBond",75)
poses = [
    (1,0,0,0),
    (15,-10,-0.03,0),
    (28,12,0.08,-6),
    (42,-6,0.03,5),
    (58,-2,0.05,0),
    (75,0,0,0),
]
for f,head_x,body_z,shell_x in poses:
    key_bone("head",f,rot=(math.radians(head_x),0,0))
    key_bone("body",f,loc=(0,0,body_z),rot=(math.radians(-4 if f in (28,42) else 0),0,0))
    key_bone("shell_root",f,rot=(math.radians(shell_x),0,0))
for b in ["leg_F.L","leg_F.R","leg_B.L","leg_B.R"]:
    key_bone(b,1,rot=(0,0,0)); key_bone(b,28,rot=(math.radians(18),0,0)); key_bone(b,75,rot=(0,0,0))

# Make Idle active for saved file
arm.animation_data.action = bpy.data.actions.get("Idle")
scene.frame_start=1
scene.frame_end=90
scene.frame_set(1)

# -----------------------------
# Preview ground / lighting / camera
# -----------------------------
bpy.ops.mesh.primitive_plane_add(size=16, location=(0,0,-0.005))
ground = bpy.context.object
ground.name="Preview_Ground"
ground.data.materials.append(MAT_SAND)
move_to_collection(ground, preview_col)

# rock shapes
for i,(x,y,s) in enumerate([(-2.8,0.5,1.2),(2.6,-0.7,0.9),(-2.2,-2.1,0.75),(2.3,2.0,0.65)]):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=s, location=(x,y,s*0.35))
    rock=bpy.context.object
    rock.name=f"Preview_Rock_{i}"
    rock.scale.z=0.55
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(rock)
    rock.data.materials.append(MAT_ROCK)
    move_to_collection(rock, preview_col)

# Sun
bpy.ops.object.light_add(type='AREA', location=(4.5,-4.0,7.0))
key=bpy.context.object
key.name="Preview_Key"
key.data.energy=1000
key.data.shape='DISK'
key.data.size=5.0
key.rotation_euler=(math.radians(25),0,math.radians(35))
move_to_collection(key, preview_col)

bpy.ops.object.light_add(type='AREA', location=(-4.0,3.0,4.0))
fill=bpy.context.object
fill.name="Preview_Fill"
fill.data.energy=650
fill.data.color=(0.45,0.65,0.80)
fill.data.size=4.0
fill.rotation_euler=(math.radians(60),0,math.radians(-120))
move_to_collection(fill, preview_col)

bpy.ops.object.light_add(type='AREA', location=(0,-3.5,2.5))
rim=bpy.context.object
rim.name="Preview_Rim"
rim.data.energy=500
rim.data.color=(1.0,0.55,0.25)
rim.data.size=3.0
rim.rotation_euler=(math.radians(75),0,0)
move_to_collection(rim, preview_col)

# Camera
bpy.ops.object.camera_add(location=(4.7,6.7,3.25))
cam=bpy.context.object
cam.name="Preview_Camera"
move_to_collection(cam, preview_col)
scene.camera=cam

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat('-Z','Y').to_euler()

look_at(cam,(0,0.35,0.75))
cam.data.lens=56

# -----------------------------
# Save, render, export
# -----------------------------
bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

# Preview render
scene.frame_set(1)
scene.render.filepath=PREVIEW_PATH
bpy.ops.render.render(write_still=True)

# Select only Champion collection objects
bpy.ops.object.select_all(action='DESELECT')
for obj in champion_col.objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active=arm

bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_skins=True,
    export_def_bones=True,
    export_apply=False,
    export_yup=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_extras=True,
    export_force_sampling=True,
    export_optimize_animation_size=True
)

print("SHELVORA_BUILD_COMPLETE")
print(BLEND_PATH)
print(GLB_PATH)
print(PREVIEW_PATH)
print("Actions:", sorted([a.name for a in bpy.data.actions if a.name in {
    'Idle','Walk','Run','TurnLeft','TurnRight','JumpStart','JumpLoop','Land',
    'GuardIn','GuardHold','GuardOut','Interact','RelicBond'
}]))
