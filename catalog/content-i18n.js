import { getLanguage } from "./i18n.js";

// Entry IDs and original formula names remain stable across translations.
export const entryTitles = {
  container20: ["20-foot container", "20 英尺集装箱"],
  container40: ["40-foot container", "40 英尺集装箱"],
  container40hc: ["High-cube container", "高箱集装箱"],
  jersey_barrier: ["Concrete barrier", "混凝土护栏"],
  light_mast: ["Lighting mast", "照明灯杆"],
  fence_panel: ["Fence panel", "围栏单元"],
  guard_booth: ["Guard booth", "警卫岗亭"],
  gate_arm: ["Barrier gate", "道闸"],
  bollard_mooring: ["Mooring bollard", "系船柱"],
  bollard_post: ["Protective bollard", "防撞柱"],
  relay_node: ["Uplink relay", "上行中继站"],
  shelf_rack: ["Storage rack", "重型货架"],
  stairs_metal: ["Steel stairs", "钢制楼梯"],
  catwalk: ["Catwalk", "检修走道"],
  reefer_unit: ["Refrigeration unit", "制冷机组"],
  barrel: ["Steel drum", "钢桶"],
  pallet: ["Wooden pallet", "木托盘"],
  pallet_stack: ["Pallet stack", "托盘堆"],
  crate_wood: ["Shipping crate", "木制运输箱"],
  crate_stack: ["Crate stack", "运输箱堆"],
  ibc_tote: ["IBC tank", "IBC 吨桶"],
  forklift: ["Forklift", "叉车"],
  cable_reel: ["Cable reel", "电缆卷盘"],
  tire_stack: ["Tire stack", "轮胎堆"],
  dumpster: ["Waste container", "垃圾箱"],
  generator: ["Generator", "发电机"],
  jerry_can: ["Jerry can", "油桶"],
  traffic_cone: ["Traffic cone", "交通锥"],
  gas_cylinders: ["Gas cylinders", "气瓶组"],
  tarp_cargo: ["Tarp-covered cargo", "篷布覆盖的货物"],
  sandbags: ["Sandbags", "沙袋"],
  toolbox_cart: ["Tool cart", "工具推车"],
  floodlight_stand: ["Portable floodlight", "移动式泛光灯"],
  cardboard_boxes: ["Cardboard boxes", "纸箱"],
  pipe_stack: ["Pipe stack", "管材堆"],
  sign_post: ["Signpost", "指示牌"],
  rifle: ["PAC-9 Longshore", "PAC-9 Longshore 步枪"],
  pistol: ["PAC-4 Bosun", "PAC-4 Bosun 手枪"],
  hound: ["Hound / Ground robot", "Hound / 地面机器人"],
  gull: ["Gull / Flying robot", "Gull / 飞行机器人"],
  hands: ["Hand / Finger rig", "手部 / 手指骨架"],
  crane: ["Gantry crane / Saltline 04", "门式起重机 / Saltline 04"],
  ship: ["Cargo ship / Kittiwake", "货船 / Kittiwake"],
  boat: ["Extraction boat", "撤离艇"],
  "sea-waves": ["Water / Wave field", "水面 / 波浪场"],
  "math-box": ["Boxes & transformations", "长方体与变换"],
  "math-lathe": ["Profile rotation & cylinders", "轮廓旋转与圆柱体"],
  "math-tube": ["Splines & tubes", "样条曲线与管道"],
  "math-noise": ["Value noise & seeds", "值噪声与随机种子"],
  "math-spring": ["Damped spring", "阻尼弹簧"],
  "math-ik": ["Inverse kinematics", "逆运动学"],
  "math-dsp": ["Audio synthesis / DSP", "音频合成 / 数字信号处理"],
};

const descriptions = {
  container20: [
    "Corrugated panels, corner fittings and moving doors. A parametric profile forms the body; color, seed, wear and door opening can be adjusted.",
    "由波纹钢板、角件和可动箱门组成。箱体基于参数化轮廓构建，可调整颜色、随机种子、磨损程度与箱门开度。",
  ],
  container40: [
    "The long container uses the same profile function and door geometry as the 20-foot model, with its own dimensions.",
    "长型集装箱与 20 英尺型号共用轮廓函数和箱门几何结构，但尺寸不同。",
  ],
  container40hc: [
    "The taller container variant uses the same procedural construction, with a nominal height of 2.90 meters.",
    "加高型集装箱采用相同的程序化构建方式，标称高度为 2.90 米。",
  ],
  relay_node: [
    "An animated switching unit built from an enclosure, antenna, fan and signal light. Its three states control the light intensity and mechanical motion.",
    "由机柜、天线、风扇和信号灯组成的动态开关设备。三种状态控制灯光强度与机械运动。",
  ],
  barrel: [
    "A revolved drum profile with reinforcing bands and lid details. The original parameters control color, orientation and the open-top variant.",
    "桶身由轮廓旋转生成，带有加强箍与桶盖细节。原始参数控制颜色、摆放方向以及开口状态。",
  ],
  rifle: [
    "The rifle's original geometry model, including separate bolt and magazine parts. The preview shows the geometry without the player's hands.",
    "步枪的原始几何模型，包含独立的枪机与弹匣部件。预览展示不带玩家手部的几何体。",
  ],
  pistol: [
    "The original pistol model, with separate frame, slide, barrel and magazine geometry. Each associated sound can be previewed separately.",
    "手枪原始模型，枪身、套筒、枪管与弹匣具有独立的几何体。相关音效可逐一试听。",
  ],
  hound: [
    "The four-legged ground robot has a procedural skeleton and a solver for its leg angles. The preview shows the original model in its bind pose; the walking controller is available in the source code.",
    "四足地面机器人具有程序化骨架和腿部角度求解器。预览显示原始模型的绑定姿势，行走控制器可在源代码中查看。",
  ],
  gull: [
    "Four rotors, a sensor gimbal and a weapon module form a skeletal model. The preview shows the bind pose with animated rotors; XS contains flight control and crash behavior.",
    "四个旋翼、传感器云台与武器模块共同组成骨骼模型。预览展示绑定姿势及旋翼动画；飞行控制与坠毁行为位于 XS 中。",
  ],
  hands: [
    "The procedural right player hand with articulated fingers. Joint positions, poses and the associated geometry are constructed in code.",
    "程序化生成的玩家右手，带有关节化手指。关节位置、姿势及相关几何体均由代码构建。",
  ],
  crane: [
    "A harbor crane assembled from beams, cabins and cables. Its spreader swings according to the original function.",
    "由梁架、驾驶室和钢索组成的港口起重机。吊具按照原始函数摆动。",
  ],
  ship: [
    "The hull is generated as a parametric surface. Superstructures, containers and radar are added as geometry.",
    "船体由参数化曲面生成，再以几何体补充上层建筑、集装箱与雷达。",
  ],
  boat: [
    "A procedural inflatable boat with an interior and engine. The preview uses the roll and pitch of the original animation.",
    "程序化生成的充气艇，包含内部结构与发动机。预览沿用原始动画的横摇与纵摇。",
  ],
  "sea-waves": [
    "Four directional waves define the moving water height. The preview evaluates the original height function over a patch of water in front of the quay.",
    "四个定向波共同决定动态水面高度。预览在码头前的一片水域上计算原始高度函数。",
  ],
  "math-box": [
    "The basic geometry functions behind enclosures, beams and containers.",
    "机柜、梁架与集装箱背后的基础几何函数。",
  ],
  "math-lathe": [
    "Radius–height profiles become three-dimensional surfaces of revolution.",
    "将半径—高度轮廓转换为三维旋转曲面。",
  ],
  "math-tube": [
    "Curved tube geometry along a Catmull–Rom spline, plus cylinders aligned between endpoints.",
    "沿 Catmull–Rom 样条曲线生成弯曲管道，并在端点之间对齐圆柱体。",
  ],
  "math-noise": [
    "A spatially continuous noise field from the original Jn function. The seed and selected row change the displayed region.",
    "由原始 Jn 函数生成的空间连续噪声场。随机种子与所选行会改变显示区域。",
  ],
  "math-spring": [
    "Step response of the original spring function ll with k = 45, c = 8 and Δt = 1/120 s. The target jumps to 1 at t = 0.",
    "原始弹簧函数 ll 的阶跃响应：k = 45、c = 8、Δt = 1/120 秒。目标值在 t = 0 时跃变为 1。",
  ],
  "math-ik": [
    "The angle solver for the Hound's legs. The 3D model shows the corresponding skeleton in its bind pose; the full algorithm is available in US.",
    "Hound 腿部的角度求解器。三维模型展示对应骨架的绑定姿势，完整算法可在 US 中查看。",
  ],
  "math-dsp": [
    "Noise, exponential envelopes, biquad filters and delayed layers form the building blocks of the sound bank. The plot shows ms with a 0.01 s attack and a 0.12 s decay.",
    "噪声、指数包络、双二阶滤波器与延迟音层构成声音库的基础。图像展示起音时间为 0.01 秒、衰减时间为 0.12 秒的 ms 函数。",
  ],
};

export const formulaTranslations = {
  "Vom Bauteil zum Objekt": [
    "From parts to objects",
    "The constructors combine primitive geometries. Translation, quaternion rotation and scaling place each part in a shared coordinate system. The formula describes the transformation used in the code.",
    "从部件到物体",
    "构造函数将基本几何体组合起来，通过平移、四元数旋转与缩放，将各部件放入统一坐标系。公式描述了代码中使用的变换。",
  ],
  "Quader & Fasen": [
    "Boxes & bevels",
    "Boxes form the base shapes. Ei limits the bevel radius and moves the vertices of a subdivided box; ot can align the geometry at the bottom or center.",
    "长方体与倒角",
    "长方体构成基础形状。Ei 限制倒角半径并移动细分长方体的顶点；ot 可将几何体的底部或中心对齐。",
  ],
  Rotationskörper: [
    "Surfaces of revolution",
    "A sequence of radius–height pairs is revolved around the y-axis. Discrete angular steps form the surface of drums, tires, reels and cylinders. This is the mathematical interpretation of the LatheGeometry construction.",
    "旋转曲面",
    "将一系列半径—高度坐标对绕 y 轴旋转。离散角度步长构成桶、轮胎、卷盘与圆柱体的表面。这是对 LatheGeometry 构建过程的数学解释。",
  ],
  "Wiederholte Bauteile": [
    "Repeated parts",
    "Loops generate struts, boards, steps and ribs at fixed intervals. Each constructor contains the specific counts and spacing.",
    "重复部件",
    "循环以固定间距生成支撑杆、木板、台阶与加强筋。具体数量和间距见各构造函数。",
  ],
  "Deterministische Oberflächenvariation": [
    "Deterministic surface variation",
    "Jn interpolates four grid values using smoothstep. Seeded generators such as Fl and Nl produce reproducible variations; different constructors may use different generators.",
    "确定性表面变化",
    "Jn 使用 smoothstep 对四个网格值进行插值。Fl、Nl 等带种子的生成器产生可复现的变化；不同构造函数可能使用不同生成器。",
  ],
  "Rohre & Verbindungen": [
    "Tubes & connections",
    "A cylinder takes the distance between its endpoints as its length, moves to their midpoint and uses a quaternion to align with the connecting direction. Curved pipes also use splines.",
    "管道与连接",
    "圆柱体以两端点的距离为长度，移动至两点中点，并通过四元数对齐连接方向。弯曲管道还会使用样条曲线。",
  ],
  "Trapezförmige Containerwellung": [
    "Trapezoidal container corrugation",
    "Rk describes a periodic trapezoidal profile with period P, depth d, flat width f and ramp width s. sh places vertices exactly at the transitions, preserving sharp corrugation edges.",
    "集装箱梯形波纹",
    "Rk 描述周期为 P、深度为 d、平面宽度为 f、斜坡宽度为 s 的周期性梯形轮廓。sh 将顶点精确放置在过渡位置，保持波纹边缘清晰。",
  ],
  "Inverse Kinematik der Beine": [
    "Leg inverse kinematics",
    "US solves the leg angles using the law of cosines. Reach is limited so unreachable foot targets cannot produce invalid angles. Ky contains the original parameters.",
    "腿部逆运动学",
    "US 利用余弦定理求解腿部角度，并限制可达距离，防止不可达的足部目标产生无效角度。原始参数位于 Ky 中。",
  ],
  "Gedämpfte Feder": [
    "Damped spring",
    "ll integrates spring force and damping with a semi-implicit Euler step. The model produces compliant motion; k is stiffness and c is damping.",
    "阻尼弹簧",
    "ll 使用半隐式欧拉步长积分弹簧力与阻尼，产生柔顺的运动。其中 k 为刚度，c 为阻尼系数。",
  ],
  "Überlagerung von Wasserwellen": [
    "Superposition of water waves",
    "Hw sums four directional waves from Og. Directions, wavelengths and amplitudes come from the game; a spatial mask attenuates distant motion. The preview shows the height field of this CPU function; the water shader adds further detail.",
    "水波叠加",
    "Hw 对 Og 中的四个定向波求和。方向、波长与振幅来自游戏；空间遮罩衰减远处的运动。预览展示此 CPU 函数的高度场，水面着色器另行补充细节。",
  ],
  "Hüllkurve & Frequenzverlauf": [
    "Envelope & frequency sweep",
    "ms generates an exponential attack–decay envelope; without an attack, the first factor is omitted. ei interpolates frequencies exponentially. Generators combine these blocks with noise and oscillators; the source code shows each mix.",
    "包络与频率扫描",
    "ms 生成指数起音—衰减包络；没有起音阶段时省略第一个因子。ei 以指数方式插值频率。生成器将这些模块与噪声、振荡器组合，各自的混合方式见源代码。",
  ],
  "Mischen, filtern, normalisieren": [
    "Mixing, filtering & normalization",
    "Se adds time-shifted layers. kt uses a biquad filter with coefficients calculated by mu. j6 normalizes the finished buffer; fixed limits the gain factor to at most 1. The preview plays this exact buffer with adjustable catalog volume.",
    "混合、滤波与归一化",
    "Se 叠加带时间偏移的音层。kt 使用双二阶滤波器，系数由 mu 计算。j6 对最终缓冲区进行归一化；fixed 将增益因子限制为不超过 1。试听播放的正是该缓冲区，图鉴音量可调。",
  ],
  "Pulsierendes Signallicht": [
    "Pulsing signal light",
    "The relay switches between live, cutting and cut. Its constructor provides an update function for the light, fan and spring-loaded door. The state can be changed in the preview.",
    "脉动信号灯",
    "中继站在 live、cutting 与 cut 状态间切换。构造函数提供灯光、风扇与弹簧门的更新函数，可在预览中切换状态。",
  ],
  "Gelenkkette der Finger": [
    "Finger joint chain",
    "Fingers form hierarchical joint chains. The formula describes the composition of local translations and rotations; the original functions define joint positions, poses and skinning weights.",
    "手指关节链",
    "手指形成层级关节链。公式描述局部平移与旋转的组合；原始函数定义关节位置、姿势与蒙皮权重。",
  ],
  "Schwingung des Spreaders": [
    "Spreader oscillation",
    "kw superimposes slow sine waves for the suspended lifting attachment. The preview uses this original update function.",
    "吊具摆动",
    "kw 为悬挂吊具叠加缓慢的正弦振荡。预览使用此原始更新函数。",
  ],
  "Parametrische Rumpffläche": [
    "Parametric hull surface",
    "N0 computes the hull position and adds stern taper and longitudinal offset. Ba obtains normals from the cross product of two finite differences. This is an excerpt; the source code contains the complete surface.",
    "参数化船体曲面",
    "N0 计算船体位置，并加入船尾收窄与纵向偏移。Ba 通过两个有限差分向量的叉积求取法线。此处为节选，完整曲面定义见源代码。",
  ],
  "Rollen & Stampfen": [
    "Roll & pitch",
    "The original kw function moves the hull group using two superimposed oscillations. In showcase mode, the mean boat height stays fixed.",
    "横摇与纵摇",
    "原始 kw 函数以两个叠加振荡驱动船体组。在展示模式中，船只的平均高度保持固定。",
  ],
};

// Each sound has a name in German, English and simplified Chinese.
export const soundLabels = {
  rifle_shot: ["Gewehr / Schuss", "Rifle / Shot", "步枪 / 射击"],
  pistol_shot: ["Pistole / Schuss", "Pistol / Shot", "手枪 / 射击"],
  rifle_tail_out: [
    "Gewehr / Außennachhall",
    "Rifle / Outdoor tail",
    "步枪 / 室外余响",
  ],
  rifle_tail_in: [
    "Gewehr / Innennachhall",
    "Rifle / Indoor tail",
    "步枪 / 室内余响",
  ],
  pistol_tail_out: [
    "Pistole / Außennachhall",
    "Pistol / Outdoor tail",
    "手枪 / 室外余响",
  ],
  pistol_tail_in: [
    "Pistole / Innennachhall",
    "Pistol / Indoor tail",
    "手枪 / 室内余响",
  ],
  rifle_dry: ["Gewehr / Leerklick", "Rifle / Dry fire", "步枪 / 空击"],
  pistol_dry: ["Pistole / Leerklick", "Pistol / Dry fire", "手枪 / 空击"],
  reload_magout: [
    "Gewehr / Magazin entnehmen",
    "Rifle / Remove magazine",
    "步枪 / 取出弹匣",
  ],
  reload_maginsert: [
    "Gewehr / Magazin einführen",
    "Rifle / Insert magazine",
    "步枪 / 插入弹匣",
  ],
  reload_magin: [
    "Gewehr / Magazin einrasten",
    "Rifle / Seat magazine",
    "步枪 / 锁定弹匣",
  ],
  reload_boltback: [
    "Gewehr / Verschluss zurück",
    "Rifle / Pull bolt back",
    "步枪 / 后拉枪机",
  ],
  reload_bolt: [
    "Gewehr / Verschluss vor",
    "Rifle / Release bolt",
    "步枪 / 释放枪机",
  ],
  pistol_magout: [
    "Pistole / Magazin entnehmen",
    "Pistol / Remove magazine",
    "手枪 / 取出弹匣",
  ],
  pistol_maginsert: [
    "Pistole / Magazin einführen",
    "Pistol / Insert magazine",
    "手枪 / 插入弹匣",
  ],
  pistol_magin: [
    "Pistole / Magazin einrasten",
    "Pistol / Seat magazine",
    "手枪 / 锁定弹匣",
  ],
  pistol_slide: ["Pistole / Schlitten", "Pistol / Slide", "手枪 / 套筒"],
  weapon_holster: ["Waffe / Wegstecken", "Weapon / Holster", "武器 / 收起"],
  weapon_draw: ["Waffe / Ziehen", "Weapon / Draw", "武器 / 拔出"],
  gear_rustle: ["Ausrüstung / Rascheln", "Gear / Rustle", "装备 / 窸窣声"],
  shell_bounce: ["Hülse / Aufprall", "Casing / Bounce", "弹壳 / 弹落"],
  shell_bounce_metal: [
    "Hülse / Metallaufprall",
    "Casing / Metal bounce",
    "弹壳 / 金属碰撞",
  ],
  step_concrete: ["Schritt / Beton", "Footstep / Concrete", "脚步 / 混凝土"],
  step_water: ["Schritt / Wasser", "Footstep / Water", "脚步 / 水面"],
  step_metal: ["Schritt / Metall", "Footstep / Metal", "脚步 / 金属"],
  land: ["Spieler / Landung", "Player / Landing", "玩家 / 落地"],
  jump: ["Spieler / Sprung", "Player / Jump", "玩家 / 跳跃"],
  hurt: ["Spieler / Treffer", "Player / Hurt", "玩家 / 受伤"],
  ear_ring: ["Spieler / Ohrklingen", "Player / Ear ringing", "玩家 / 耳鸣"],
  impact_metal: ["Treffer / Metall", "Impact / Metal", "撞击 / 金属"],
  impact_concrete: ["Treffer / Beton", "Impact / Concrete", "撞击 / 混凝土"],
  impact_wood: ["Treffer / Holz", "Impact / Wood", "撞击 / 木材"],
  impact_water: ["Treffer / Wasser", "Impact / Water", "撞击 / 水面"],
  impact_enemy: ["Treffer / Roboter", "Impact / Robot", "撞击 / 机器人"],
  impact_glass: ["Treffer / Glas", "Impact / Glass", "撞击 / 玻璃"],
  whiz: ["Geschoss / Vorbeiflug", "Bullet / Flyby", "子弹 / 掠过"],
  ricochet: ["Geschoss / Abpraller", "Bullet / Ricochet", "子弹 / 跳弹"],
  gull_fire: ["Gull / Feuer", "Gull / Fire", "Gull / 射击"],
  hound_fire: ["Hound / Feuer", "Hound / Fire", "Hound / 射击"],
  hound_step: ["Hound / Schritt", "Hound / Step", "Hound / 脚步"],
  gull_die: ["Gull / Zerstörung", "Gull / Destruction", "Gull / 摧毁"],
  hound_die: ["Hound / Zerstörung", "Hound / Destruction", "Hound / 摧毁"],
  telegraph: [
    "Roboter / Angriffssignal",
    "Robot / Attack cue",
    "机器人 / 攻击预警",
  ],
  alert: ["Roboter / Alarm", "Robot / Alert", "机器人 / 警报"],
  explosion: ["Explosion", "Explosion", "爆炸"],
  explosion_big: ["Große Explosion", "Large explosion", "大型爆炸"],
  relay_cut: ["Relais / Abschalten", "Relay / Shutdown", "中继站 / 关闭"],
  thunder: ["Hafen / Donner", "Harbor / Thunder", "港口 / 雷声"],
  foghorn: ["Hafen / Nebelhorn", "Harbor / Foghorn", "港口 / 雾笛"],
  gull_cry: ["Hafen / Möwenruf", "Harbor / Seagull call", "港口 / 海鸥鸣叫"],
  halyard: ["Hafen / Takelage", "Harbor / Rigging", "港口 / 索具"],
  container_bang: ["Container / Schlag", "Container / Bang", "集装箱 / 敲击"],
  ui_click: ["Interface / Klick", "Interface / Click", "界面 / 点击"],
  ui_hover: ["Interface / Hover", "Interface / Hover", "界面 / 悬停"],
  gull_rotor: ["Gull / Rotor", "Gull / Rotor", "Gull / 旋翼"],
  hound_servo: ["Hound / Servo", "Hound / Servo", "Hound / 伺服电机"],
  relay_hum: ["Relais / Brummen", "Relay / Hum", "中继站 / 嗡鸣"],
  rain: ["Regen / außen", "Rain / Outdoor", "雨声 / 室外"],
  rain_interior: ["Regen / innen", "Rain / Indoor", "雨声 / 室内"],
  wind: ["Hafen / Wind", "Harbor / Wind", "港口 / 风声"],
  sea: ["Hafen / Meer", "Harbor / Sea", "港口 / 海浪"],
  music_drone: ["Musik / Bordun", "Music / Drone", "音乐 / 持续音"],
  music_strings: ["Musik / Streicher", "Music / Strings", "音乐 / 弦乐"],
  music_pulse: ["Musik / Puls", "Music / Pulse", "音乐 / 脉冲"],
  music_ticks: ["Musik / Ticks", "Music / Ticks", "音乐 / 滴答节奏"],
  music_drums: ["Musik / Schlagzeug", "Music / Drums", "音乐 / 鼓组"],
  music_brass: ["Musik / Blechbläser", "Music / Brass", "音乐 / 铜管"],
  music_lift: ["Musik / Steigerung", "Music / Lift", "音乐 / 推进段"],
  mus_cell: ["Musik / Motiv", "Music / Motif", "音乐 / 动机"],
  mus_horn: ["Musik / Hornsignal", "Music / Horn cue", "音乐 / 号角提示"],
  mus_fill: ["Musik / Übergang", "Music / Fill", "音乐 / 过门"],
  mus_hit: ["Musik / Akzent", "Music / Accent", "音乐 / 重音"],
  mus_riser: ["Musik / Anstieg", "Music / Riser", "音乐 / 上升音效"],
  mus_impact: ["Musik / Einschlag", "Music / Impact", "音乐 / 冲击音效"],
  objective: ["Ziel erreicht", "Objective complete", "目标完成"],
  death: ["Tod", "Death", "死亡"],
  complete: ["Mission abgeschlossen", "Mission complete", "任务完成"],
  ir_outdoor: [
    "Impulsantwort / draußen",
    "Impulse response / Outdoor",
    "脉冲响应 / 室外",
  ],
  ir_shed: [
    "Impulsantwort / Halle",
    "Impulse response / Warehouse",
    "脉冲响应 / 仓库",
  ],
};

const notes = {
  generic: [
    "Material impact sound from the game's hit mapping. Static objects do not have their own continuous sound.",
    "根据游戏命中映射选取的材质撞击音。静态物体没有专属的持续音。",
  ],
  relay_node: [
    "Dedicated relay sounds from the sound bank.",
    "声音库中的中继站专属音效。",
  ],
  barrel: [
    "Metal impacts; in the game, the explosion is assigned to a red, closed drum standing upright.",
    "金属撞击音；游戏中的爆炸音效对应红色、封闭且直立的钢桶。",
  ],
  gas_cylinders: [
    "Metal impacts and the gas cylinders' explosion sound.",
    "气瓶组的金属撞击音与爆炸音效。",
  ],
  crane: [
    "No dedicated sound generator is assigned to the crane.",
    "起重机未关联专属声音生成器。",
  ],
  ship: [
    "Harbor ambience, rather than sounds triggered directly by the ship.",
    "港口环境音，并非由船只直接触发的物体音效。",
  ],
  boat: [
    "Associated harbor ambience; the audio catalog has no dedicated engine loop for the boat.",
    "相关港口环境音；音频图鉴中没有此船专属的发动机循环音。",
  ],
};

export function localizedSoundTitle(id, language = getLanguage()) {
  const labels = soundLabels[id];
  if (!labels) throw new Error("Missing sound translation: " + id);
  return labels[language === "de" ? 0 : language === "zh" ? 2 : 1];
}

export function localizeEntry(entry, language) {
  const formulas = entry.formulas.map((formula) => {
    if (language === "de") return { ...formula, key: formula.title };
    const translated = formulaTranslations[formula.title];
    if (!translated)
      throw new Error("Missing formula translation: " + formula.title);
    const column = language === "zh" ? 2 : 0;
    return {
      ...formula,
      key: formula.title,
      title: translated[column],
      explanation: translated[column + 1],
    };
  });
  if (language === "de") return { ...entry, formulas };
  const column = language === "zh" ? 1 : 0;
  const title =
    entry.kind === "sound"
      ? localizedSoundTitle(entry.soundId, language)
      : entryTitles[entry.id]?.[column];
  if (!title) throw new Error("Missing entry translation: " + entry.id);
  let description = descriptions[entry.id]?.[column];
  if (!description && entry.kind === "prop")
    description =
      language === "zh"
        ? `此港口物体完全由构造函数 ${entry.builder} 中的几何体构成。预览使用此原始函数与游戏中的程序化材质。`
        : `This harbor object is built entirely from geometry in constructor ${entry.builder}. The preview uses this original function and the game's procedural materials.`;
  if (entry.kind === "sound")
    description = entry.spec.ir
      ? language === "zh"
        ? "用于卷积混响的原始合成脉冲响应。试听播放脉冲缓冲区本身；游戏中则用它对其他声音进行卷积。"
        : "The original synthetic impulse response for convolution reverb. The preview plays the impulse buffer itself; the game uses it to convolve other sounds."
      : language === "zh"
        ? `来自原始声音库的程序化${entry.spec.loop ? "循环音" : "单次音效"}。变体数量：${entry.spec.n}。所有变体均由声音名称与变体索引确定性生成。`
        : `A procedural ${entry.spec.loop ? "loop" : "one-shot sound"} from the original sound bank. Variants: ${entry.spec.n}. Each is generated deterministically from the sound name and variant index.`;
  if (!description) throw new Error("Missing entry description: " + entry.id);
  return {
    ...entry,
    title,
    description,
    formulas,
    soundNote: entry.soundNote
      ? notes[entry.id in notes ? entry.id : "generic"][column]
      : undefined,
  };
}
