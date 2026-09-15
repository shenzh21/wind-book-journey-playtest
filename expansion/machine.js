(function(root){'use strict';const world={
  "id": "machine",
  "name": "机械迷城",
  "theme": {
    "sky": "#243c49",
    "far": "#49656c",
    "ground": "#70898a",
    "accent": "#e8bd73"
  },
  "ability": {
    "name": "磁力手套",
    "mode": "magnet",
    "description": "按 C 会被附近最近的齿轮吸过去，牵引方向随齿轮的位置变化，接近轮缘时减速。按 Z 可中断牵引。蓝色胸芯暴露时，磁力也能拔出巨像的铆钉。 带铜环的换乘齿轮可以一直吸附等待，按Z跳离。",
    "teacher": {
      "x": 680,
      "y": 4578
    }
  },
  "tasks": [
    {
      "id": "machine-v3-red",
      "title": "八枚红币的巡城路线",
      "hint": "在城市各层找到八枚红币，再回到入口登记员处按 ↑ 兑换。",
      "bookTitle": "城市的八个角落",
      "content": [
        "登记员把八枚红币撒在不同街区。他说，这不是检查谁跑得快，而是想知道还有哪些街道值得被看见。",
        "回来的旅人讲起钟楼、旧车间和灯下的花。登记员认真记下的没有一个数字，只有八段路上的故事。"
      ],
      "reward": {
        "x": 900,
        "y": 4564
      },
      "stages": [
        {
          "type": "redcoins",
          "targets": [
            "machine-v3-red-0",
            "machine-v3-red-1",
            "machine-v3-red-2",
            "machine-v3-red-3",
            "machine-v3-red-4",
            "machine-v3-red-5",
            "machine-v3-red-6",
            "machine-v3-red-7"
          ],
          "redeem": "machine-v3-red-keeper",
          "text": "找齐八枚红币，回入口登记员处按 ↑ 兑换风之书。"
        }
      ]
    },
    {
      "id": "machine-v3-boss",
      "title": "铆钉巨像",
      "hint": "检修坪上的巨像会追近你。看黄灯蓄力：冲锋要跳过，高扫可蹲下，砸地会扬起冲击波。蓝色胸芯暴露时靠近用磁力拔出铆钉；受损后它会加快攻势。",
      "bookTitle": "第一颗不编号的星",
      "content": [
        "观星机为每颗星编了号码。一个夜晚，它在镜片中发现一粒很小的光，迟迟没有按下登记键。",
        "那是它第一次梦见的星星。保管员说，这颗不用编号，你可以直接叫它朋友。"
      ],
      "reward": {
        "x": 4400,
        "y": 2964
      },
      "challengeData": {
        "origin": {
          "x": 4400,
          "y": 2978
        },
        "arena": {
          "x": 3800,
          "y": 2520,
          "w": 1200,
          "h": 480
        },
        "floor": "machine-colossus-courtyard",
        "maxHits": 6
      },
      "stages": [
        {
          "type": "challenge",
          "targets": [
            "machine-v3-boss"
          ],
          "challenge": "machine-boss",
          "text": "检修坪上的巨像会追近你。看黄灯蓄力：冲锋要跳过，高扫可蹲下，砸地会扬起冲击波。蓝色胸芯暴露时靠近用磁力拔出铆钉；受损后它会加快攻势。"
        }
      ]
    },
    {
      "id": "machine-v4-patrol",
      "title": "让全城的航线恢复正常",
      "hint": "三台失控机器人正在全城巡飞，会在站台上方低飞停顿。靠近时用 X，或从上方踩踏，让它们恢复正常；可乘缆车提前拦截，不必先接任务。三台修好后，风之书会出现在邮轨总站。",
      "bookTitle": "机器人也需要问路",
      "content": [
        "零号记得每一封信的地址，壹号记得每一颗松动的螺丝，贰号记得所有钟楼的时间。狂风把它们的航线打成结，它们便一圈圈寻找并不存在的下一站。",
        "旅人替它们轻轻按回松开的零件。三台机器人第一次在总站碰面，交换沿途看见的窗灯。原来城市不只是正确的坐标，也有人在路口等你回来。"
      ],
      "reward": {
        "x": 2500,
        "y": 4404
      },
      "challengeData": {
        "scope": "world",
        "origin": {
          "x": 2700,
          "y": 4418
        },
        "dock": {
          "x": 2700,
          "y": 4360
        }
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-patrol",
          "targets": [
            "machine-patrol-dispatch",
            "machine-patrol-post",
            "machine-patrol-service",
            "machine-patrol-clock"
          ],
          "text": "三台失控机器人正在全城巡飞，会在站台上方低飞停顿。靠近时用 X，或从上方踩踏，让它们恢复正常；可乘缆车提前拦截，不必先接任务。三台修好后，风之书会出现在邮轨总站。"
        }
      ]
    },
    {
      "id": "machine-v5-flywheel",
      "title": "让城市的飞轮对准归途",
      "hint": "站位重量、奔跑和碰撞改变飞轮转速。让黄点对准绿色缺口并完全停下；经过缺口或仍在缓慢摆动都不算。 轴心的小压板靠站立重量压紧制动，离开压板即可松开；提前一点踩住，让惯性把标记送到缺口。",
      "bookTitle": "停下来的方向",
      "content": [
        "城市每天转过许多圈，却总有人错过回家的桥。老工匠在飞轮上刻了一道缺口：不为催促，只为让两段路有机会碰到一起。",
        "旅人没有拆掉飞轮。他让它慢下来，等那道缺口走到晚灯下。锁销轻轻响了一声，桥那头有人说，原来你还记得这条路。"
      ],
      "reward": {
        "x": 7100,
        "y": 1592
      },
      "challengeData": {
        "scope": "world",
        "origin": {
          "x": 6700,
          "y": 1878
        },
        "center": {
          "x": 6700,
          "y": 1878
        },
        "radius": 250,
        "inertia": 650000,
        "playerMass": 1,
        "angularDrag": 0.1,
        "targetAngle": 2.4,
        "initialAngle": 1.4,
        "initialSpeed": 0.85,
        "rim": [
          "machine-flywheel-rim-0",
          "machine-flywheel-rim-1",
          "machine-flywheel-rim-2",
          "machine-flywheel-rim-3",
          "machine-flywheel-rim-4",
          "machine-flywheel-rim-5",
          "machine-flywheel-rim-6",
          "machine-flywheel-rim-7"
        ],
        "bridge": "machine-flywheel-lock-bridge",
        "from": "machine-flywheel-axle-walk",
        "to": "machine-flywheel-upper-exit",
        "stopSpeed": 0.008,
        "stopAngle": 0.055
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-flywheel",
          "targets": [
            "machine-flywheel-axle"
          ],
          "text": "站位重量、奔跑和碰撞改变飞轮转速。让黄点对准绿色缺口并完全停下；经过缺口或仍在缓慢摆动都不算。 轴心的小压板靠站立重量压紧制动，离开压板即可松开；提前一点踩住，让惯性把标记送到缺口。"
        }
      ]
    },
    {
      "id": "machine-v12-coins",
      "title": "街巷里的三十枚金币",
      "bookTitle": "零钱听见的城市",
      "content": [
        "一枚硬币在城里转了三十次手，记住了三十种笑声。",
        "最后它躺进一个温暖的口袋，发现最响的声音并不是自己。"
      ],
      "reward": {
        "x": 2140,
        "y": 3764
      },
      "hint": "在机械迷城收集30枚普通金币，再来找街巷记账员。金币不会被扣除。",
      "challengeData": {
        "mode": "coins",
        "count": 30,
        "scope": "world"
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-city",
          "targets": [
            "machine-coin-npc"
          ],
          "text": "在机械迷城收集30枚普通金币，再来找街巷记账员。金币不会被扣除。"
        }
      ]
    },
    {
      "id": "machine-v12-summit",
      "title": "把天空再翻高一点",
      "bookTitle": "帽子上面的天空",
      "content": [
        "钟楼修完以后，工匠说，再高一点的地方留给风。",
        "一个戴帽子的旅人翻过身去，发现风早就替他留了一页。"
      ],
      "reward": {
        "x": 2910,
        "y": 149
      },
      "hint": "从观星台最高屋顶奔跑、反向后空翻，再在最高处二段跳，登上没有梯子的钟尖。",
      "challengeData": {
        "mode": "summit",
        "platform": "machine-summit-spire",
        "scope": "world"
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-city",
          "targets": [
            "machine-summit-book"
          ],
          "text": "从观星台最高屋顶奔跑、反向后空翻，再在最高处二段跳，登上没有梯子的钟尖。"
        }
      ]
    },
    {
      "id": "machine-v12-transfer",
      "title": "两班车之间的齿轮",
      "bookTitle": "等一班慢车",
      "content": [
        "第一班车只送到半路，第二班车总要晚一点。",
        "挂在齿轮旁的人终于明白，等待有时也是路的一部分。"
      ],
      "reward": {
        "x": 8750,
        "y": 364
      },
      "hint": "右上方：乘第一部吊台接近齿轮，按C吸住等车；按Z离开齿轮，跳上第二部吊台前往藏书台。",
      "challengeData": {
        "mode": "transfer",
        "platform": "machine-transfer-island",
        "scope": "world"
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-city",
          "targets": [
            "machine-transfer-book"
          ],
          "text": "右上方：乘第一部吊台接近齿轮，按C吸住等车；按Z离开齿轮，跳上第二部吊台前往藏书台。"
        }
      ]
    },
    {
      "id": "machine-v12-reader",
      "title": "一本舍不得放手的书",
      "bookTitle": "第一行字",
      "content": [
        "他不认识第一页上的字，却记得递来书时那双手的温度。",
        "图书馆里，老人教他的第一个字是“来”。他写得很慢，写完便推开了门。"
      ],
      "reward": {
        "x": 6850,
        "y": 3944
      },
      "hint": "我听说书是极好的东西，我虽然不识字，但是也想要读书，可以让我留下这本书吗?",
      "challengeData": {
        "mode": "reader",
        "visitorText": "那本书留下了一个书签，识字的老爷爷告诉我书签指向一个云端的图书馆，我本来还不相信......",
        "scope": "world"
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-city",
          "targets": [
            "machine-reader"
          ],
          "text": "我听说书是极好的东西，我虽然不识字，但是也想要读书，可以让我留下这本书吗?"
        }
      ]
    },
    {
      "id": "machine-v12-letter",
      "title": "穿过城市的一封回信",
      "bookTitle": "地址写着一声叹息",
      "content": [
        "邮差收到一封信，地址只有一声叹息。他走过工房、码头和钟楼。",
        "每个人添了一句话，等信到达时，叹息已经变成了一声笑。"
      ],
      "reward": {
        "x": 900,
        "y": 2284
      },
      "hint": "把邮轨总站的信送到西侧老钟楼的守夜人手中。没有倒计时；乘吊台、走屋顶或用滑轮穿过街区。",
      "challengeData": {
        "mode": "letter",
        "startText": "守夜人很久没收到回信了。你能把这封信带到西侧老钟楼吗？",
        "endText": "原来大家都还记得我。请把我保存的这本书带回去吧。",
        "scope": "world"
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-city",
          "targets": [
            "machine-letter-start",
            "machine-letter-end"
          ],
          "text": "把邮轨总站的信送到西侧老钟楼的守夜人手中。没有倒计时；乘吊台、走屋顶或用滑轮穿过街区。"
        }
      ]
    },
    {
      "id": "machine-v12-pipes",
      "title": "让三条蒸汽管重新呼吸",
      "bookTitle": "开水的远大理想",
      "content": [
        "锅炉里的水梦想做一条河，便先做成蒸汽，沿管道走遍城市。",
        "冷凝码头的老人喝了一口茶：这杯水有远方的味道。"
      ],
      "reward": {
        "x": 4680,
        "y": 3544
      },
      "hint": "用X打开西区滑轮出口、锅炉院和东区起重机出口的三个阀门，恢复锅炉院升降台，乘它到水塔取书。",
      "challengeData": {
        "mode": "pipes",
        "platform": "machine-pipe-library",
        "scope": "world"
      },
      "stages": [
        {
          "type": "challenge",
          "challenge": "machine-city",
          "targets": [
            "machine-valve-west",
            "machine-valve-boiler",
            "machine-valve-east"
          ],
          "text": "用X打开西区滑轮出口、锅炉院和东区起重机出口的三个阀门，恢复锅炉院升降台，乘它到水塔取书。"
        }
      ]
    }
  ],
  "revision": 17,
  "size": {
    "w": 9000,
    "h": 5000
  },
  "entry": {
    "x": 500,
    "y": 4578
  },
  "exit": {
    "x": 500,
    "y": 4578
  },
  "platforms": [
    {
      "id": "machine-landing-0-0",
      "x": 200,
      "y": 4600,
      "w": 900,
      "h": 24,
      "type": "wood",
      "baseX": 200,
      "baseY": 4600,
      "cityStyle": "roof",
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-canal-step",
      "x": 1200,
      "y": 4780,
      "w": 600,
      "h": 24,
      "type": "wood",
      "baseX": 1200,
      "baseY": 4780,
      "cityStyle": "roof",
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-post-stair",
      "x": 1900,
      "y": 4600,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 1900,
      "baseY": 4600,
      "cityStyle": "roof",
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-landing-0-2",
      "x": 2300,
      "y": 4440,
      "w": 800,
      "h": 24,
      "type": "wood",
      "baseX": 2300,
      "baseY": 4440,
      "cityStyle": "bridge",
      "artKind": "conveyor",
      "artDepth": 50
    },
    {
      "id": "machine-underpass",
      "x": 3260,
      "y": 4600,
      "w": 170,
      "h": 24,
      "type": "wood",
      "baseX": 3260,
      "baseY": 4600,
      "cityStyle": "roof",
      "artKind": "carriage",
      "artDepth": 48
    },
    {
      "id": "machine-boiler-door",
      "x": 3900,
      "y": 4440,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 3900,
      "baseY": 4440,
      "cityStyle": "roof",
      "artKind": "pipe",
      "artDepth": 50
    },
    {
      "id": "machine-steam-yard",
      "x": 4100,
      "y": 4220,
      "w": 700,
      "h": 24,
      "type": "wood",
      "baseX": 4100,
      "baseY": 4220,
      "cityStyle": "roof",
      "artKind": "conveyor",
      "artDepth": 105
    },
    {
      "id": "machine-pipe-walk",
      "x": 4940,
      "y": 4380,
      "w": 170,
      "h": 24,
      "type": "wood",
      "baseX": 4940,
      "baseY": 4380,
      "cityStyle": "roof",
      "artKind": "carriage",
      "artDepth": 48
    },
    {
      "id": "machine-cargo-roof",
      "x": 5550,
      "y": 4200,
      "w": 500,
      "h": 24,
      "type": "wood",
      "baseX": 5550,
      "baseY": 4200,
      "cityStyle": "roof",
      "artKind": "conveyor",
      "artDepth": 90
    },
    {
      "id": "machine-dock-step",
      "x": 6160,
      "y": 4040,
      "w": 230,
      "h": 24,
      "type": "wood",
      "baseX": 6160,
      "baseY": 4040,
      "cityStyle": "roof",
      "artKind": "pipe",
      "artDepth": 50
    },
    {
      "id": "machine-polarity-yard",
      "x": 6500,
      "y": 3980,
      "w": 700,
      "h": 24,
      "type": "wood",
      "baseX": 6500,
      "baseY": 3980,
      "cityStyle": "roof",
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-dock-canopy",
      "x": 7300,
      "y": 4160,
      "w": 350,
      "h": 24,
      "type": "wood",
      "baseX": 7300,
      "baseY": 4160,
      "cityStyle": "roof",
      "surface": [
        [
          7300,
          4160
        ],
        [
          7650,
          4240
        ]
      ],
      "artKind": "awning",
      "artDepth": 70
    },
    {
      "id": "machine-landing-1-4",
      "x": 7400,
      "y": 4440,
      "w": 900,
      "h": 24,
      "type": "wood",
      "baseX": 7400,
      "baseY": 4440,
      "cityStyle": "roof",
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-machine-hoist-0-upper-dock",
      "x": 1100,
      "y": 3980,
      "w": 360,
      "h": 24,
      "type": "wood",
      "baseX": 1100,
      "baseY": 3980,
      "cityStyle": "roof",
      "artKind": "crate",
      "artDepth": 90
    },
    {
      "id": "machine-gear-step",
      "x": 1470,
      "y": 3970,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 1470,
      "baseY": 3970,
      "cityStyle": "bridge",
      "artKind": "carriage",
      "artDepth": 50
    },
    {
      "id": "machine-gears-yard",
      "x": 1650,
      "y": 3800,
      "w": 700,
      "h": 24,
      "type": "wood",
      "baseX": 1650,
      "baseY": 3800,
      "cityStyle": "roof",
      "artKind": "copper",
      "artDepth": 80
    },
    {
      "id": "machine-old-balcony",
      "x": 780,
      "y": 3800,
      "w": 260,
      "h": 24,
      "type": "wood",
      "baseX": 780,
      "baseY": 3800,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-laundry-roof",
      "x": 570,
      "y": 3790,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 570,
      "baseY": 3790,
      "cityStyle": "bridge",
      "artKind": "carriage",
      "artDepth": 50
    },
    {
      "id": "machine-water-tank",
      "x": 820,
      "y": 3440,
      "w": 330,
      "h": 24,
      "type": "wood",
      "baseX": 820,
      "baseY": 3440,
      "cityStyle": "roof",
      "artKind": "boiler",
      "artDepth": 105
    },
    {
      "id": "machine-landing-1-0",
      "x": 800,
      "y": 3180,
      "w": 400,
      "h": 24,
      "type": "wood",
      "baseX": 800,
      "baseY": 3180,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-machine-hoist-4-exit",
      "x": 1850,
      "y": 3020,
      "w": 600,
      "h": 24,
      "type": "wood",
      "baseX": 1850,
      "baseY": 3020,
      "cityStyle": "bridge",
      "artKind": "conveyor",
      "artDepth": 50
    },
    {
      "id": "machine-bird-roof",
      "x": 2200,
      "y": 2840,
      "w": 370,
      "h": 24,
      "type": "wood",
      "baseX": 2200,
      "baseY": 2840,
      "cityStyle": "roof",
      "surface": [
        [
          2200,
          2940
        ],
        [
          2380,
          2840
        ],
        [
          2570,
          2840
        ]
      ],
      "artKind": "awning",
      "artDepth": 70
    },
    {
      "id": "machine-tram-roof",
      "x": 2690,
      "y": 3000,
      "w": 170,
      "h": 24,
      "type": "wood",
      "baseX": 2690,
      "baseY": 3000,
      "cityStyle": "roof",
      "artKind": "carriage",
      "artDepth": 48
    },
    {
      "id": "machine-west-gate",
      "x": 3160,
      "y": 3140,
      "w": 620,
      "h": 24,
      "type": "wood",
      "baseX": 3160,
      "baseY": 3140,
      "cityStyle": "roof",
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-machine-hoist-1-upper-dock",
      "x": 3100,
      "y": 3820,
      "w": 360,
      "h": 24,
      "type": "wood",
      "baseX": 3100,
      "baseY": 3820,
      "cityStyle": "roof",
      "artKind": "crate",
      "artDepth": 90
    },
    {
      "id": "machine-dispatch-roof",
      "x": 3500,
      "y": 3640,
      "w": 380,
      "h": 24,
      "type": "wood",
      "baseX": 3500,
      "baseY": 3640,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64,
      "surface": [
        [
          3500,
          3660
        ],
        [
          3690,
          3640
        ],
        [
          3880,
          3660
        ]
      ]
    },
    {
      "id": "machine-switch-roof",
      "x": 3950,
      "y": 3460,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 3950,
      "baseY": 3460,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-boss-stair",
      "x": 3520,
      "y": 3280,
      "w": 400,
      "h": 24,
      "type": "wood",
      "baseX": 3520,
      "baseY": 3280,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-colossus-courtyard",
      "x": 3800,
      "y": 3000,
      "w": 1200,
      "h": 24,
      "type": "wood",
      "baseX": 3800,
      "baseY": 3000,
      "cityStyle": "roof",
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-landing-2-2",
      "x": 5000,
      "y": 3000,
      "w": 350,
      "h": 24,
      "type": "wood",
      "baseX": 5000,
      "baseY": 3000,
      "cityStyle": "roof",
      "artKind": "crate",
      "artDepth": 90
    },
    {
      "id": "machine-machine-hoist-5-exit",
      "x": 6000,
      "y": 2840,
      "w": 400,
      "h": 24,
      "type": "wood",
      "baseX": 6000,
      "baseY": 2840,
      "cityStyle": "roof",
      "artKind": "crate",
      "artDepth": 90
    },
    {
      "id": "machine-grapple-yard",
      "x": 6500,
      "y": 2660,
      "w": 700,
      "h": 24,
      "type": "wood",
      "baseX": 6500,
      "baseY": 2660,
      "cityStyle": "bridge",
      "artKind": "conveyor",
      "artDepth": 50
    },
    {
      "id": "machine-west-ledge",
      "x": 500,
      "y": 3000,
      "w": 330,
      "h": 24,
      "type": "wood",
      "baseX": 500,
      "baseY": 3000,
      "cityStyle": "roof",
      "artKind": "pipe",
      "artDepth": 50
    },
    {
      "id": "machine-clock-balcony",
      "x": 260,
      "y": 2820,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 260,
      "baseY": 2820,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64,
      "surface": [
        [
          260,
          2840
        ],
        [
          560,
          2820
        ]
      ]
    },
    {
      "id": "machine-clock-roof",
      "x": 580,
      "y": 2640,
      "w": 350,
      "h": 24,
      "type": "wood",
      "baseX": 580,
      "baseY": 2640,
      "cityStyle": "roof",
      "artKind": "copper",
      "artDepth": 60
    },
    {
      "id": "machine-bell-ledge",
      "x": 480,
      "y": 2480,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 480,
      "baseY": 2480,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-landing-3-0",
      "x": 400,
      "y": 2320,
      "w": 650,
      "h": 24,
      "type": "wood",
      "baseX": 400,
      "baseY": 2320,
      "cityStyle": "roof",
      "artKind": "copper",
      "artDepth": 60
    },
    {
      "id": "machine-machine-hoist-3-upper-dock",
      "x": 1060,
      "y": 1700,
      "w": 400,
      "h": 24,
      "type": "wood",
      "baseX": 1060,
      "baseY": 1700,
      "cityStyle": "roof",
      "artKind": "crate",
      "artDepth": 90
    },
    {
      "id": "machine-antenna-step",
      "x": 1450,
      "y": 1560,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 1450,
      "baseY": 1560,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-antenna-roof",
      "x": 1850,
      "y": 1400,
      "w": 400,
      "h": 24,
      "type": "wood",
      "baseX": 1850,
      "baseY": 1400,
      "cityStyle": "roof",
      "artKind": "copper",
      "artDepth": 80
    },
    {
      "id": "machine-copper-roof",
      "x": 2350,
      "y": 1400,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 2350,
      "baseY": 1400,
      "cityStyle": "bridge",
      "artKind": "carriage",
      "artDepth": 50
    },
    {
      "id": "machine-observatory-base",
      "x": 3000,
      "y": 1400,
      "w": 700,
      "h": 24,
      "type": "wood",
      "baseX": 3000,
      "baseY": 1400,
      "cityStyle": "roof",
      "artKind": "glass",
      "artDepth": 95
    },
    {
      "id": "machine-sky-post",
      "x": 3820,
      "y": 1580,
      "w": 170,
      "h": 24,
      "type": "wood",
      "baseX": 3820,
      "baseY": 1580,
      "cityStyle": "roof",
      "artKind": "carriage",
      "artDepth": 48
    },
    {
      "id": "machine-night-roof",
      "x": 4440,
      "y": 1400,
      "w": 650,
      "h": 24,
      "type": "wood",
      "baseX": 4440,
      "baseY": 1400,
      "cityStyle": "roof",
      "artKind": "copper",
      "artDepth": 80
    },
    {
      "id": "machine-turbine-roof",
      "x": 5150,
      "y": 1410,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 5150,
      "baseY": 1410,
      "cityStyle": "bridge",
      "artKind": "carriage",
      "artDepth": 50
    },
    {
      "id": "machine-turbine-step",
      "x": 5780,
      "y": 1700,
      "w": 450,
      "h": 24,
      "type": "wood",
      "baseX": 5780,
      "baseY": 1700,
      "cityStyle": "roof",
      "artKind": "conveyor",
      "artDepth": 50
    },
    {
      "id": "machine-flywheel-base",
      "x": 5900,
      "y": 1900,
      "w": 500,
      "h": 24,
      "type": "wood",
      "baseX": 5900,
      "baseY": 1900,
      "cityStyle": "roof",
      "artKind": "girder",
      "artDepth": 48
    },
    {
      "id": "machine-flywheel-axle-walk",
      "x": 6460,
      "y": 1900,
      "w": 340,
      "h": 24,
      "type": "wood",
      "baseX": 6460,
      "baseY": 1900,
      "cityStyle": "roof",
      "artKind": "girder",
      "artDepth": 48
    },
    {
      "id": "machine-flywheel-upper-exit",
      "x": 7010,
      "y": 1628,
      "w": 230,
      "h": 24,
      "type": "wood",
      "baseX": 7010,
      "baseY": 1628,
      "cityStyle": "roof",
      "artKind": "girder",
      "artDepth": 48
    },
    {
      "id": "machine-glass-roof",
      "x": 7360,
      "y": 1480,
      "w": 400,
      "h": 24,
      "type": "wood",
      "baseX": 7360,
      "baseY": 1480,
      "cityStyle": "roof",
      "artKind": "glass",
      "artDepth": 95
    },
    {
      "id": "machine-machine-hoist-2-upper-dock",
      "x": 8300,
      "y": 3820,
      "w": 350,
      "h": 24,
      "type": "wood",
      "baseX": 8300,
      "baseY": 3820,
      "cityStyle": "roof",
      "artKind": "crate",
      "artDepth": 90
    },
    {
      "id": "machine-east-sign",
      "x": 7980,
      "y": 3630,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 7980,
      "baseY": 3630,
      "cityStyle": "bridge",
      "artKind": "basket",
      "artDepth": 50,
      "assembly": "machine-hoist-6"
    },
    {
      "id": "machine-east-balcony",
      "x": 8280,
      "y": 3630,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 8280,
      "baseY": 3630,
      "cityStyle": "bridge",
      "artKind": "basket",
      "artDepth": 50,
      "assembly": "machine-hoist-6"
    },
    {
      "id": "machine-east-tank",
      "x": 7900,
      "y": 3280,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 7900,
      "baseY": 3280,
      "cityStyle": "roof",
      "artKind": "boiler",
      "artDepth": 105
    },
    {
      "id": "machine-east-clock",
      "x": 8260,
      "y": 3260,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 8260,
      "baseY": 3260,
      "cityStyle": "bridge",
      "artKind": "carriage",
      "artDepth": 50
    },
    {
      "id": "machine-east-roof",
      "x": 7770,
      "y": 2920,
      "w": 400,
      "h": 24,
      "type": "wood",
      "baseX": 7770,
      "baseY": 2920,
      "cityStyle": "roof",
      "artKind": "conveyor",
      "artDepth": 80
    },
    {
      "id": "machine-east-canopy",
      "x": 7510,
      "y": 2740,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 7510,
      "baseY": 2740,
      "cityStyle": "roof",
      "artKind": "awning",
      "artDepth": 70
    },
    {
      "id": "machine-east-lantern",
      "x": 7740,
      "y": 2730,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 7740,
      "baseY": 2730,
      "cityStyle": "bridge",
      "artKind": "carriage",
      "artDepth": 50
    },
    {
      "id": "machine-east-eaves",
      "x": 8150,
      "y": 2380,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 8150,
      "baseY": 2380,
      "cityStyle": "roof",
      "artKind": "awning",
      "artDepth": 70
    },
    {
      "id": "machine-laser-yard",
      "x": 7300,
      "y": 2100,
      "w": 850,
      "h": 24,
      "type": "wood",
      "baseX": 7300,
      "baseY": 2100,
      "cityStyle": "roof",
      "artKind": "glass",
      "artDepth": 95
    },
    {
      "id": "machine-laser-upper",
      "x": 7780,
      "y": 1920,
      "w": 250,
      "h": 24,
      "type": "wood",
      "baseX": 7780,
      "baseY": 1920,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-glass-balcony",
      "x": 7510,
      "y": 1680,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 7510,
      "baseY": 1680,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-observatory-step-a",
      "x": 3400,
      "y": 1150,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 3400,
      "baseY": 1150,
      "cityStyle": "bridge",
      "artKind": "basket",
      "artDepth": 50,
      "assembly": "machine-hoist-7"
    },
    {
      "id": "machine-observatory-step-b",
      "x": 3100,
      "y": 1150,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 3100,
      "baseY": 1150,
      "cityStyle": "bridge",
      "artKind": "basket",
      "artDepth": 50,
      "assembly": "machine-hoist-7"
    },
    {
      "id": "machine-observatory-step-c",
      "x": 3360,
      "y": 860,
      "w": 260,
      "h": 24,
      "type": "wood",
      "baseX": 3360,
      "baseY": 860,
      "cityStyle": "roof",
      "artKind": "balcony",
      "artDepth": 64
    },
    {
      "id": "machine-observatory-step-d",
      "x": 3000,
      "y": 680,
      "w": 300,
      "h": 24,
      "type": "wood",
      "baseX": 3000,
      "baseY": 680,
      "cityStyle": "roof",
      "artKind": "conveyor",
      "artDepth": 64
    },
    {
      "id": "machine-observatory-crown",
      "x": 2700,
      "y": 500,
      "w": 420,
      "h": 24,
      "type": "wood",
      "baseX": 2700,
      "baseY": 500,
      "cityStyle": "roof",
      "artKind": "dome",
      "artDepth": 145
    },
    {
      "id": "machine-laser-mirror-low",
      "x": 7510,
      "y": 2030,
      "w": 100,
      "h": 24,
      "type": "wood",
      "baseX": 7510,
      "baseY": 2030,
      "cityStyle": "roof",
      "artKind": "pipe",
      "artDepth": 50
    },
    {
      "id": "machine-laser-mirror-high",
      "x": 7510,
      "y": 1910,
      "w": 100,
      "h": 24,
      "type": "wood",
      "baseX": 7510,
      "baseY": 1910,
      "cityStyle": "roof",
      "artKind": "pipe",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-0-left",
      "x": 1130,
      "y": 4290,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 1130,
      "baseY": 4290,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-0",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-1-left",
      "x": 3130,
      "y": 4130,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 3130,
      "baseY": 4130,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-1",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-2-left",
      "x": 8330,
      "y": 4130,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 8330,
      "baseY": 4130,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-2",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-3-left",
      "x": 1080,
      "y": 2010,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 1080,
      "baseY": 2010,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-3",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-4-left",
      "x": 1270,
      "y": 3180,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 1270,
      "baseY": 3180,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-4",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-4-right",
      "x": 1570,
      "y": 3180,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 1570,
      "baseY": 3180,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-4",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-5-left",
      "x": 5420,
      "y": 3000,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 5420,
      "baseY": 3000,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-5",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-hoist-5-right",
      "x": 5720,
      "y": 3000,
      "w": 180,
      "h": 24,
      "type": "wood",
      "baseX": 5720,
      "baseY": 3000,
      "cityStyle": "bridge",
      "assembly": "machine-hoist-5",
      "artKind": "basket",
      "artDepth": 50
    },
    {
      "id": "machine-flywheel-rim-0",
      "x": 6898,
      "y": 1836,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6898,
      "baseY": 1836,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-rim-1",
      "x": 6856,
      "y": 2022,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6856,
      "baseY": 2022,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-rim-2",
      "x": 6694,
      "y": 2124,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6694,
      "baseY": 2124,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-rim-3",
      "x": 6508,
      "y": 2082,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6508,
      "baseY": 2082,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-rim-4",
      "x": 6406,
      "y": 1920,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6406,
      "baseY": 1920,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-rim-5",
      "x": 6448,
      "y": 1734,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6448,
      "baseY": 1734,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-rim-6",
      "x": 6610,
      "y": 1632,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6610,
      "baseY": 1632,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-rim-7",
      "x": 6796,
      "y": 1674,
      "w": 96,
      "h": 24,
      "type": "wood",
      "baseX": 6796,
      "baseY": 1674,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "tread",
      "artDepth": 26
    },
    {
      "id": "machine-flywheel-lock-bridge",
      "x": 6780,
      "y": 1628,
      "w": 230,
      "h": 24,
      "type": "wood",
      "baseX": 6780,
      "baseY": 1628,
      "cityStyle": "bridge",
      "assembly": "machine-flywheel",
      "artKind": "girder",
      "artDepth": 48
    },
    {
      "id": "machine-laser-entry-ledge",
      "x": 8100,
      "y": 2240,
      "baseX": 8100,
      "baseY": 2240,
      "w": 230,
      "h": 24,
      "type": "wood",
      "cityStyle": "bridge",
      "artKind": "pipe",
      "artDepth": 50
    },
    {
      "id": "machine-summit-spire",
      "x": 2800,
      "y": 185,
      "w": 220,
      "h": 22,
      "type": "wood",
      "baseX": 7360,
      "baseY": 1480,
      "cityStyle": "roof",
      "artKind": "spire",
      "artDepth": 315
    },
    {
      "id": "machine-transfer-first",
      "x": 7650,
      "y": 1480,
      "w": 170,
      "h": 22,
      "type": "wood",
      "baseX": 7360,
      "baseY": 1480,
      "cityStyle": "roof",
      "artKind": "carriage",
      "artDepth": 48
    },
    {
      "id": "machine-transfer-second",
      "x": 8290,
      "y": 740,
      "w": 170,
      "h": 22,
      "type": "wood",
      "baseX": 7360,
      "baseY": 1480,
      "cityStyle": "roof",
      "artKind": "carriage",
      "artDepth": 48
    },
    {
      "id": "machine-transfer-island",
      "x": 8600,
      "y": 400,
      "w": 340,
      "h": 22,
      "type": "wood",
      "baseX": 7360,
      "baseY": 1480,
      "cityStyle": "roof",
      "artKind": "glass",
      "artDepth": 95
    },
    {
      "id": "machine-pipe-lift",
      "x": 4270,
      "y": 4220,
      "w": 170,
      "h": 22,
      "type": "wood",
      "baseX": 7360,
      "baseY": 1480,
      "cityStyle": "roof",
      "artKind": "carriage",
      "artDepth": 48
    },
    {
      "id": "machine-pipe-library",
      "x": 4510,
      "y": 3580,
      "w": 320,
      "h": 22,
      "type": "wood",
      "baseX": 7360,
      "baseY": 1480,
      "cityStyle": "roof",
      "artKind": "boiler",
      "artDepth": 105
    },
    {
      "id": "machine-post-wait-west",
      "x": 2180,
      "y": 4440,
      "w": 120,
      "h": 24,
      "type": "wood",
      "cityStyle": "bridge",
      "baseX": 2180,
      "baseY": 4440,
      "artKind": "quay",
      "artDepth": 70
    },
    {
      "id": "machine-post-wait-east",
      "x": 3100,
      "y": 4440,
      "w": 120,
      "h": 24,
      "type": "wood",
      "cityStyle": "bridge",
      "baseX": 3100,
      "baseY": 4440,
      "artKind": "quay",
      "artDepth": 70
    }
  ],
  "coins": [
    {
      "id": "machine-hand-coin-a",
      "x": 450,
      "y": 4550
    },
    {
      "id": "machine-hand-coin-b",
      "x": 750,
      "y": 4550
    },
    {
      "id": "machine-hand-coin-c",
      "x": 1280,
      "y": 4730
    },
    {
      "id": "machine-hand-coin-d",
      "x": 1640,
      "y": 4730
    },
    {
      "id": "machine-hand-coin-e",
      "x": 2000,
      "y": 4550
    },
    {
      "id": "machine-hand-coin-f",
      "x": 2570,
      "y": 4390
    },
    {
      "id": "machine-hand-coin-g",
      "x": 2840,
      "y": 4390
    },
    {
      "id": "machine-hand-coin-h",
      "x": 3440,
      "y": 4550
    },
    {
      "id": "machine-hand-coin-i",
      "x": 1510,
      "y": 4726
    },
    {
      "id": "machine-hand-coin-j",
      "x": 4250,
      "y": 4170
    },
    {
      "id": "machine-hand-coin-k",
      "x": 4590,
      "y": 4170
    },
    {
      "id": "machine-hand-coin-l",
      "x": 5120,
      "y": 4330
    },
    {
      "id": "machine-hand-coin-m",
      "x": 5750,
      "y": 4150
    },
    {
      "id": "machine-hand-coin-n",
      "x": 6270,
      "y": 3990
    },
    {
      "id": "machine-hand-coin-o",
      "x": 6730,
      "y": 3930
    },
    {
      "id": "machine-hand-coin-p",
      "x": 7000,
      "y": 3930
    },
    {
      "id": "machine-hand-coin-q",
      "x": 7570,
      "y": 4390
    },
    {
      "id": "machine-hand-coin-r",
      "x": 8000,
      "y": 4390
    },
    {
      "id": "machine-hand-coin-s",
      "x": 1190,
      "y": 3930
    },
    {
      "id": "machine-hand-coin-t",
      "x": 1900,
      "y": 3750
    },
    {
      "id": "machine-hand-coin-u",
      "x": 630,
      "y": 3570
    },
    {
      "id": "machine-hand-coin-v",
      "x": 1000,
      "y": 3130
    },
    {
      "id": "machine-hand-coin-w",
      "x": 2060,
      "y": 2970
    },
    {
      "id": "machine-hand-coin-x",
      "x": 2800,
      "y": 2950
    },
    {
      "id": "machine-hand-coin-y",
      "x": 3290,
      "y": 3090
    },
    {
      "id": "machine-hand-coin-z",
      "x": 3700,
      "y": 3590
    },
    {
      "id": "machine-hand-coin-aa",
      "x": 4100,
      "y": 3410
    },
    {
      "id": "machine-hand-coin-ab",
      "x": 5080,
      "y": 2950
    },
    {
      "id": "machine-hand-coin-ac",
      "x": 6160,
      "y": 2790
    },
    {
      "id": "machine-hand-coin-ad",
      "x": 6990,
      "y": 2610
    },
    {
      "id": "machine-hand-coin-ae",
      "x": 8420,
      "y": 3770
    },
    {
      "id": "machine-hand-coin-af",
      "x": 8490,
      "y": 3410
    },
    {
      "id": "machine-hand-coin-ag",
      "x": 8050,
      "y": 4386
    },
    {
      "id": "machine-hand-coin-ah",
      "x": 7890,
      "y": 2870
    },
    {
      "id": "machine-hand-coin-ai",
      "x": 8290,
      "y": 2330
    },
    {
      "id": "machine-hand-coin-aj",
      "x": 7910,
      "y": 2050
    },
    {
      "id": "machine-hand-coin-ak",
      "x": 7700,
      "y": 1690
    },
    {
      "id": "machine-hand-coin-al",
      "x": 7160,
      "y": 1578
    },
    {
      "id": "machine-hand-coin-am",
      "x": 6100,
      "y": 1850
    },
    {
      "id": "machine-hand-coin-an",
      "x": 6000,
      "y": 1680
    },
    {
      "id": "machine-hand-coin-ao",
      "x": 5430,
      "y": 1530
    },
    {
      "id": "machine-hand-coin-ap",
      "x": 4690,
      "y": 1350
    },
    {
      "id": "machine-hand-coin-aq",
      "x": 4010,
      "y": 1530
    },
    {
      "id": "machine-hand-coin-ar",
      "x": 3490,
      "y": 1350
    },
    {
      "id": "machine-hand-coin-as",
      "x": 2860,
      "y": 446
    },
    {
      "id": "machine-hand-coin-at",
      "x": 3460,
      "y": 810
    },
    {
      "id": "machine-hand-coin-au",
      "x": 3070,
      "y": 630
    },
    {
      "id": "machine-hand-coin-av",
      "x": 2820,
      "y": 450
    },
    {
      "id": "machine-hand-coin-aw",
      "x": 2850,
      "y": 2946
    },
    {
      "id": "machine-hand-coin-ax",
      "x": 2070,
      "y": 1350
    },
    {
      "id": "machine-hand-coin-ay",
      "x": 1580,
      "y": 1510
    },
    {
      "id": "machine-hand-coin-az",
      "x": 1270,
      "y": 1650
    },
    {
      "id": "machine-hand-coin-ba",
      "x": 700,
      "y": 2270
    },
    {
      "id": "machine-hand-coin-bb",
      "x": 640,
      "y": 2430
    }
  ],
  "enemies": [],
  "decorations": [
    {
      "id": "facade-车站",
      "kind": "city-building",
      "name": "车站",
      "x": 220,
      "y": 4624,
      "w": 840,
      "h": 376,
      "variant": 0,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-邮轨总站",
      "kind": "city-building",
      "name": "邮轨总站",
      "x": 2320,
      "y": 4464,
      "w": 760,
      "h": 536,
      "variant": 2,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-锅炉房",
      "kind": "city-building",
      "name": "锅炉房",
      "x": 4120,
      "y": 4244,
      "w": 660,
      "h": 756,
      "variant": 1,
      "layer": 0,
      "archStyle": "factory"
    },
    {
      "id": "facade-货运仓",
      "kind": "city-building",
      "name": "货运仓",
      "x": 5570,
      "y": 4224,
      "w": 460,
      "h": 776,
      "variant": 3,
      "layer": 0,
      "archStyle": "factory"
    },
    {
      "id": "facade-磁性泊位",
      "kind": "city-building",
      "name": "磁性泊位",
      "x": 6520,
      "y": 4004,
      "w": 660,
      "h": 996,
      "variant": 2,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-冷凝码头",
      "kind": "city-building",
      "name": "冷凝码头",
      "x": 7420,
      "y": 4464,
      "w": 860,
      "h": 536,
      "variant": 1,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-齿轮公寓",
      "kind": "city-building",
      "name": "齿轮公寓",
      "x": 1670,
      "y": 3824,
      "w": 660,
      "h": 1176,
      "variant": 0,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-洗衣楼",
      "kind": "city-building",
      "name": "洗衣楼",
      "x": 590,
      "y": 3644,
      "w": 240,
      "h": 1356,
      "variant": 3,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-旧钟楼",
      "kind": "city-building",
      "name": "旧钟楼",
      "x": 420,
      "y": 2344,
      "w": 610,
      "h": 2656,
      "variant": 2,
      "layer": 0,
      "archStyle": "clock"
    },
    {
      "id": "facade-双篮出口",
      "kind": "city-building",
      "name": "双篮出口",
      "x": 1870,
      "y": 3044,
      "w": 560,
      "h": 1956,
      "variant": 0,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-检修坪",
      "kind": "city-building",
      "name": "检修坪",
      "x": 3820,
      "y": 3024,
      "w": 1160,
      "h": 1976,
      "variant": 2,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-吊钩工房",
      "kind": "city-building",
      "name": "吊钩工房",
      "x": 6520,
      "y": 2684,
      "w": 660,
      "h": 2316,
      "variant": 1,
      "layer": 0,
      "archStyle": "factory"
    },
    {
      "id": "facade-天线楼",
      "kind": "city-building",
      "name": "天线楼",
      "x": 1870,
      "y": 1424,
      "w": 360,
      "h": 3576,
      "variant": 3,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-铜鸟楼",
      "kind": "city-building",
      "name": "铜鸟楼",
      "x": 2420,
      "y": 1604,
      "w": 460,
      "h": 3396,
      "variant": 0,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-观星楼",
      "kind": "city-building",
      "name": "观星楼",
      "x": 3020,
      "y": 1424,
      "w": 660,
      "h": 3576,
      "variant": 2,
      "layer": 0,
      "archStyle": "observatory"
    },
    {
      "id": "facade-夜班楼",
      "kind": "city-building",
      "name": "夜班楼",
      "x": 4460,
      "y": 1424,
      "w": 610,
      "h": 3576,
      "variant": 1,
      "layer": 0,
      "archStyle": "brick"
    },
    {
      "id": "facade-风机楼",
      "kind": "city-building",
      "name": "风机楼",
      "x": 5220,
      "y": 1604,
      "w": 410,
      "h": 3396,
      "variant": 3,
      "layer": 0,
      "archStyle": "factory"
    },
    {
      "id": "facade-玻璃塔",
      "kind": "city-building",
      "name": "玻璃塔",
      "x": 7380,
      "y": 1504,
      "w": 360,
      "h": 3496,
      "variant": 0,
      "layer": 0,
      "archStyle": "glass"
    },
    {
      "id": "facade-镜面车间",
      "kind": "city-building",
      "name": "镜面车间",
      "x": 7320,
      "y": 2124,
      "w": 810,
      "h": 2876,
      "variant": 2,
      "layer": 0,
      "archStyle": "glass"
    },
    {
      "id": "facade-东钟塔",
      "kind": "city-building",
      "name": "东钟塔",
      "x": 8340,
      "y": 3124,
      "w": 290,
      "h": 1876,
      "variant": 1,
      "layer": 0,
      "archStyle": "clock"
    },
    {
      "id": "车站气窗",
      "kind": "city-rooftop",
      "name": "车站气窗",
      "x": 310,
      "y": 4460,
      "w": 110,
      "h": 140,
      "variant": 0,
      "layer": 0,
      "fixture": "vent"
    },
    {
      "id": "邮局钟",
      "kind": "city-rooftop",
      "name": "邮局钟",
      "x": 2770,
      "y": 4300,
      "w": 110,
      "h": 140,
      "variant": 2,
      "layer": 0,
      "fixture": "clock"
    },
    {
      "id": "锅炉烟囱",
      "kind": "city-rooftop",
      "name": "锅炉烟囱",
      "x": 4560,
      "y": 4080,
      "w": 110,
      "h": 140,
      "variant": 1,
      "layer": 0,
      "fixture": "chimney"
    },
    {
      "id": "公寓水塔",
      "kind": "city-rooftop",
      "name": "公寓水塔",
      "x": 2120,
      "y": 3660,
      "w": 110,
      "h": 140,
      "variant": 3,
      "layer": 0,
      "fixture": "tank"
    },
    {
      "id": "夜班排风口",
      "kind": "city-rooftop",
      "name": "夜班排风口",
      "x": 4920,
      "y": 1260,
      "w": 110,
      "h": 140,
      "variant": 1,
      "layer": 0,
      "fixture": "vent"
    },
    {
      "id": "玻璃屋顶",
      "kind": "city-rooftop",
      "name": "玻璃屋顶",
      "x": 7910,
      "y": 1960,
      "w": 110,
      "h": 140,
      "variant": 0,
      "layer": 0,
      "fixture": "skylight"
    },
    {
      "id": "车站齿轮",
      "kind": "gear",
      "x": 700,
      "y": 4380,
      "w": 100,
      "h": 100
    },
    {
      "id": "工房齿轮",
      "kind": "gear",
      "x": 2000,
      "y": 3540,
      "w": 120,
      "h": 120
    },
    {
      "id": "西楼磁轨",
      "kind": "gear",
      "x": 250,
      "y": 2580,
      "w": 110,
      "h": 110
    },
    {
      "id": "观星磁环",
      "kind": "gear",
      "x": 3250,
      "y": 880,
      "w": 100,
      "h": 100
    },
    {
      "id": "东楼磁环",
      "kind": "gear",
      "x": 8230,
      "y": 3510,
      "w": 120,
      "h": 120
    },
    {
      "id": "玻璃磁环",
      "kind": "gear",
      "x": 7980,
      "y": 1950,
      "w": 100,
      "h": 100
    },
    {
      "id": "machine-transfer-anchor",
      "kind": "gear",
      "x": 8100,
      "y": 610,
      "w": 100,
      "h": 100,
      "layer": -1
    }
  ],
  "entities": [
    {
      "id": "machine-v3-red-keeper",
      "kind": "npc",
      "name": "红币登记员",
      "x": 820,
      "y": 4578
    },
    {
      "id": "machine-patrol-dispatch",
      "kind": "npc",
      "name": "巡城调度员",
      "x": 3180,
      "y": 4418
    },
    {
      "id": "machine-v3-boss",
      "kind": "device",
      "name": "铆钉巨像",
      "x": 4850,
      "y": 2978
    },
    {
      "id": "machine-flywheel-axle",
      "kind": "device",
      "name": "城市传动飞轮",
      "x": 6700,
      "y": 1878,
      "hiddenVisual": true
    },
    {
      "id": "machine-v3-red-0",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 3720,
      "y": 4550,
      "routePlatform": "machine-underpass"
    },
    {
      "id": "machine-v3-red-1",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 920,
      "y": 3386
    },
    {
      "id": "machine-v3-red-2",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 2580,
      "y": 1530,
      "routePlatform": "machine-copper-roof"
    },
    {
      "id": "machine-v3-red-3",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 4110,
      "y": 3406
    },
    {
      "id": "machine-v3-red-4",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 8440,
      "y": 3050,
      "routePlatform": "machine-east-clock"
    },
    {
      "id": "machine-v3-red-5",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 3140,
      "y": 990,
      "routePlatform": "machine-observatory-step-b"
    },
    {
      "id": "machine-v3-red-6",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 4810,
      "y": 1346
    },
    {
      "id": "machine-v3-red-7",
      "kind": "redcoin",
      "name": "红色风币",
      "x": 7570,
      "y": 1426
    },
    {
      "id": "machine-environment-piston",
      "kind": "device",
      "name": "液压弹射活塞",
      "x": 660,
      "y": 2618,
      "mechanic": "spring",
      "radius": 65,
      "power": 980,
      "description": "踩上活塞可弹向高处；按住 ↓ 可以平稳走过。"
    },
    {
      "id": "machine-environment-sorting-belt",
      "kind": "device",
      "name": "邮袋高速输送带",
      "x": 2700,
      "y": 4418,
      "mechanic": "conveyor",
      "radius": 400,
      "direction": 1,
      "power": 230,
      "description": "整座邮轨站台都是运输带，向右送到起重机与下一班移动平台。逆着带子走会很慢，跳起可以摆脱带面。",
      "platformId": "machine-landing-0-2"
    },
    {
      "id": "machine-environment-exhaust",
      "kind": "device",
      "name": "锅炉排气喷口",
      "x": 8100,
      "y": 3258,
      "mechanic": "gust",
      "radius": 65,
      "power": 420,
      "height": 530,
      "description": "排出的热风托起玩家，向旁边移动即可离开气柱。"
    },
    {
      "id": "machine-environment-repair-pod",
      "kind": "device",
      "name": "检修摆渡舱",
      "x": 3190,
      "y": 1378,
      "mechanic": "ferry",
      "radius": 65,
      "destination": {
        "x": 7940,
        "y": 2078
      },
      "description": "按 ↑ 乘检修舱到东侧玻璃车间，再按 ↑ 返回。"
    },
    {
      "id": "machine-patrol-post",
      "kind": "robot",
      "name": "邮轨零号",
      "color": "#d9ad76",
      "x": 2700,
      "y": 4360,
      "pause": 2.4,
      "region": "邮轨总站",
      "path": [
        {
          "x": 2700,
          "y": 4360,
          "pause": 2.4,
          "region": "邮轨总站"
        },
        {
          "x": 7800,
          "y": 4360,
          "pause": 2.4,
          "region": "冷凝码头"
        },
        {
          "x": 7800,
          "y": 2020,
          "pause": 2.4,
          "region": "玻璃车间"
        },
        {
          "x": 7100,
          "y": 1548,
          "pause": 2.4,
          "region": "飞轮出口"
        },
        {
          "x": 2800,
          "y": 420,
          "pause": 2.4,
          "region": "观星台"
        },
        {
          "x": 4400,
          "y": 2920,
          "pause": 2.4,
          "region": "铆钉检修坪"
        }
      ],
      "speed": 360,
      "patrolFlight": true
    },
    {
      "id": "machine-patrol-service",
      "kind": "robot",
      "name": "检修壹号",
      "color": "#82bac4",
      "x": 2000,
      "y": 3720,
      "pause": 2.4,
      "region": "齿轮街",
      "path": [
        {
          "x": 2000,
          "y": 3720,
          "pause": 2.4,
          "region": "齿轮街"
        },
        {
          "x": 500,
          "y": 4520,
          "pause": 2.4,
          "region": "到站广场"
        },
        {
          "x": 2700,
          "y": 4360,
          "pause": 2.4,
          "region": "邮轨总站"
        },
        {
          "x": 4400,
          "y": 2920,
          "pause": 2.4,
          "region": "铆钉检修坪"
        },
        {
          "x": 2800,
          "y": 420,
          "pause": 2.4,
          "region": "观星台"
        },
        {
          "x": 800,
          "y": 2240,
          "pause": 2.4,
          "region": "旧钟楼"
        }
      ],
      "speed": 385,
      "patrolFlight": true
    },
    {
      "id": "machine-patrol-clock",
      "kind": "robot",
      "name": "报时贰号",
      "color": "#baa0be",
      "x": 4810,
      "y": 1320,
      "pause": 2.4,
      "region": "夜班屋顶",
      "path": [
        {
          "x": 4810,
          "y": 1320,
          "pause": 2.4,
          "region": "夜班屋顶"
        },
        {
          "x": 7800,
          "y": 2020,
          "pause": 2.4,
          "region": "玻璃车间"
        },
        {
          "x": 6850,
          "y": 2580,
          "pause": 2.4,
          "region": "检修吊钩"
        },
        {
          "x": 4400,
          "y": 2920,
          "pause": 2.4,
          "region": "铆钉检修坪"
        },
        {
          "x": 2700,
          "y": 4360,
          "pause": 2.4,
          "region": "邮轨总站"
        },
        {
          "x": 500,
          "y": 4520,
          "pause": 2.4,
          "region": "到站广场"
        },
        {
          "x": 2000,
          "y": 3720,
          "pause": 2.4,
          "region": "齿轮街"
        }
      ],
      "speed": 410,
      "patrolFlight": true
    },
    {
      "id": "machine-coin-npc",
      "name": "街巷记账员",
      "x": 2000,
      "y": 3778,
      "kind": "npc",
      "description": ""
    },
    {
      "id": "machine-summit-book",
      "name": "钟尖",
      "x": 2910,
      "y": 163,
      "kind": "device",
      "description": "",
      "hiddenVisual": true
    },
    {
      "id": "machine-transfer-book",
      "name": "空中换乘站",
      "x": 8750,
      "y": 378,
      "kind": "device",
      "description": "",
      "hiddenVisual": true
    },
    {
      "id": "machine-reader",
      "name": "想读书的工人",
      "x": 6850,
      "y": 3958,
      "kind": "npc",
      "description": "书签上画着一座图书馆。我想去问问识字的老爷爷，那些字写的是什么。"
    },
    {
      "id": "machine-letter-start",
      "name": "邮轨信差",
      "x": 2230,
      "y": 4418,
      "kind": "npc",
      "description": ""
    },
    {
      "id": "machine-letter-end",
      "name": "钟楼守夜人",
      "x": 880,
      "y": 2298,
      "kind": "npc",
      "description": ""
    },
    {
      "id": "machine-valve-west",
      "name": "西区阀门",
      "x": 2080,
      "y": 2998,
      "kind": "device",
      "description": ""
    },
    {
      "id": "machine-valve-boiler",
      "name": "锅炉阀门",
      "x": 4470,
      "y": 4198,
      "kind": "device",
      "description": ""
    },
    {
      "id": "machine-valve-east",
      "name": "东区阀门",
      "x": 8400,
      "y": 3798,
      "kind": "device",
      "description": ""
    },
    {
      "id": "machine-belt-west",
      "name": "西区装卸带",
      "x": 2150,
      "y": 2998,
      "kind": "device",
      "description": "滑轮出口接着整段装卸带，送往鸟楼和跨街吊台；不要在末端停留。",
      "mechanic": "conveyor",
      "radius": 300,
      "direction": 1,
      "power": 250,
      "platformId": "machine-machine-hoist-4-exit"
    },
    {
      "id": "machine-belt-east",
      "name": "高架输送带",
      "x": 6850,
      "y": 2638,
      "kind": "device",
      "description": "高架运输带向左运行。要往东楼走，需逆流跳跃；返程可以顺着带子回到滑轮一侧。",
      "mechanic": "conveyor",
      "radius": 350,
      "direction": -1,
      "power": 270,
      "platformId": "machine-grapple-yard"
    },
    {
      "id": "machine-steam-yard-belt",
      "kind": "device",
      "name": "锅炉横贯输送带",
      "x": 4450,
      "y": 4198,
      "mechanic": "conveyor",
      "radius": 350,
      "direction": 1,
      "power": 155,
      "platformId": "machine-steam-yard",
      "description": "沿着整段运输带前进，在尽头观察下一段运输路线。"
    },
    {
      "id": "machine-cargo-roof-belt",
      "kind": "device",
      "name": "货场出站带",
      "x": 5800,
      "y": 4178,
      "mechanic": "conveyor",
      "radius": 250,
      "direction": 1,
      "power": 190,
      "platformId": "machine-cargo-roof",
      "description": "沿着整段运输带前进，在尽头观察下一段运输路线。"
    },
    {
      "id": "machine-turbine-step-belt",
      "kind": "device",
      "name": "涡轮逆行检修带",
      "x": 6005,
      "y": 1678,
      "mechanic": "conveyor",
      "radius": 225,
      "direction": -1,
      "power": 145,
      "platformId": "machine-turbine-step",
      "description": "沿着整段运输带前进，在尽头观察下一段运输路线。"
    },
    {
      "id": "machine-east-roof-belt",
      "kind": "device",
      "name": "东楼回送带",
      "x": 7970,
      "y": 2898,
      "mechanic": "conveyor",
      "radius": 200,
      "direction": -1,
      "power": 180,
      "platformId": "machine-east-roof",
      "description": "沿着整段运输带前进，在尽头观察下一段运输路线。"
    },
    {
      "id": "machine-observatory-step-d-belt",
      "kind": "device",
      "name": "镜片上料带",
      "x": 3150,
      "y": 658,
      "mechanic": "conveyor",
      "radius": 150,
      "direction": -1,
      "power": 140,
      "platformId": "machine-observatory-step-d",
      "description": "沿着整段运输带前进，在尽头观察下一段运输路线。"
    }
  ],
  "routes": [
    {
      "from": "machine-landing-0-0",
      "to": "machine-canal-step"
    },
    {
      "from": "machine-canal-step",
      "to": "machine-post-stair"
    },
    {
      "from": "machine-post-stair",
      "to": "machine-landing-0-2"
    },
    {
      "from": "machine-landing-0-2",
      "to": "machine-underpass"
    },
    {
      "from": "machine-underpass",
      "to": "machine-boiler-door"
    },
    {
      "from": "machine-boiler-door",
      "to": "machine-steam-yard"
    },
    {
      "from": "machine-steam-yard",
      "to": "machine-pipe-walk"
    },
    {
      "from": "machine-pipe-walk",
      "to": "machine-cargo-roof"
    },
    {
      "from": "machine-cargo-roof",
      "to": "machine-dock-step"
    },
    {
      "from": "machine-dock-step",
      "to": "machine-polarity-yard"
    },
    {
      "from": "machine-polarity-yard",
      "to": "machine-dock-canopy"
    },
    {
      "from": "machine-dock-canopy",
      "to": "machine-landing-1-4"
    },
    {
      "from": "machine-machine-hoist-0-upper-dock",
      "to": "machine-gear-step"
    },
    {
      "from": "machine-gear-step",
      "to": "machine-gears-yard"
    },
    {
      "from": "machine-machine-hoist-0-upper-dock",
      "to": "machine-old-balcony"
    },
    {
      "from": "machine-old-balcony",
      "to": "machine-laundry-roof"
    },
    {
      "from": "machine-laundry-roof",
      "to": "machine-water-tank"
    },
    {
      "from": "machine-water-tank",
      "to": "machine-landing-1-0"
    },
    {
      "from": "machine-landing-1-0",
      "to": "machine-west-ledge"
    },
    {
      "from": "machine-west-ledge",
      "to": "machine-clock-balcony"
    },
    {
      "from": "machine-clock-balcony",
      "to": "machine-clock-roof"
    },
    {
      "from": "machine-clock-roof",
      "to": "machine-bell-ledge"
    },
    {
      "from": "machine-bell-ledge",
      "to": "machine-landing-3-0"
    },
    {
      "from": "machine-machine-hoist-4-exit",
      "to": "machine-bird-roof"
    },
    {
      "from": "machine-bird-roof",
      "to": "machine-tram-roof"
    },
    {
      "from": "machine-tram-roof",
      "to": "machine-west-gate"
    },
    {
      "from": "machine-west-gate",
      "to": "machine-colossus-courtyard"
    },
    {
      "from": "machine-colossus-courtyard",
      "to": "machine-landing-2-2"
    },
    {
      "from": "machine-machine-hoist-1-upper-dock",
      "to": "machine-dispatch-roof"
    },
    {
      "from": "machine-dispatch-roof",
      "to": "machine-switch-roof"
    },
    {
      "from": "machine-switch-roof",
      "to": "machine-boss-stair"
    },
    {
      "from": "machine-boss-stair",
      "to": "machine-west-gate"
    },
    {
      "from": "machine-machine-hoist-5-exit",
      "to": "machine-grapple-yard"
    },
    {
      "from": "machine-grapple-yard",
      "to": "machine-east-canopy"
    },
    {
      "from": "machine-east-canopy",
      "to": "machine-east-lantern"
    },
    {
      "from": "machine-east-lantern",
      "to": "machine-east-eaves"
    },
    {
      "from": "machine-laser-yard",
      "to": "machine-laser-mirror-low"
    },
    {
      "from": "machine-laser-mirror-low",
      "to": "machine-laser-mirror-high"
    },
    {
      "from": "machine-east-tank",
      "to": "machine-east-clock"
    },
    {
      "from": "machine-east-clock",
      "to": "machine-east-roof"
    },
    {
      "from": "machine-east-roof",
      "to": "machine-east-canopy"
    },
    {
      "from": "machine-machine-hoist-3-upper-dock",
      "to": "machine-antenna-step"
    },
    {
      "from": "machine-antenna-step",
      "to": "machine-antenna-roof"
    },
    {
      "from": "machine-antenna-roof",
      "to": "machine-copper-roof"
    },
    {
      "from": "machine-copper-roof",
      "to": "machine-observatory-base"
    },
    {
      "from": "machine-observatory-base",
      "to": "machine-sky-post"
    },
    {
      "from": "machine-sky-post",
      "to": "machine-night-roof"
    },
    {
      "from": "machine-night-roof",
      "to": "machine-turbine-roof"
    },
    {
      "from": "machine-turbine-roof",
      "to": "machine-turbine-step"
    },
    {
      "from": "machine-turbine-step",
      "to": "machine-flywheel-base"
    },
    {
      "from": "machine-flywheel-base",
      "to": "machine-flywheel-axle-walk"
    },
    {
      "from": "machine-flywheel-upper-exit",
      "to": "machine-glass-roof"
    },
    {
      "from": "machine-glass-roof",
      "to": "machine-glass-balcony"
    },
    {
      "from": "machine-glass-balcony",
      "to": "machine-laser-upper"
    },
    {
      "from": "machine-laser-upper",
      "to": "machine-laser-yard"
    },
    {
      "from": "machine-observatory-step-c",
      "to": "machine-observatory-step-d"
    },
    {
      "from": "machine-observatory-step-d",
      "to": "machine-observatory-crown"
    },
    {
      "from": "machine-east-eaves",
      "to": "machine-laser-entry-ledge"
    },
    {
      "from": "machine-laser-entry-ledge",
      "to": "machine-laser-yard"
    },
    {
      "from": "machine-observatory-crown",
      "to": "machine-summit-spire",
      "move": "backflip-double"
    },
    {
      "from": "machine-post-stair",
      "to": "machine-post-wait-west"
    },
    {
      "from": "machine-post-wait-west",
      "to": "machine-landing-0-2"
    },
    {
      "from": "machine-landing-0-2",
      "to": "machine-post-wait-east"
    }
  ],
  "shortcuts": [],
  "machines": [
    {
      "id": "machine-hoist-0",
      "kind": "crane",
      "name": "往返起重吊台",
      "decks": [
        "machine-hoist-0-left"
      ],
      "lowY": 4600,
      "highY": 3980,
      "speed": 115,
      "pause": 0.9,
      "anchor": {
        "x": 1220,
        "y": 3820
      },
      "from": "machine-landing-0-0",
      "to": "machine-machine-hoist-0-upper-dock",
      "authoredClearance": true
    },
    {
      "id": "machine-hoist-1",
      "kind": "crane",
      "name": "往返起重吊台",
      "decks": [
        "machine-hoist-1-left"
      ],
      "lowY": 4440,
      "highY": 3820,
      "speed": 115,
      "pause": 0.9,
      "anchor": {
        "x": 3220,
        "y": 3660
      },
      "from": "machine-landing-0-2",
      "to": "machine-machine-hoist-1-upper-dock",
      "authoredClearance": true
    },
    {
      "id": "machine-hoist-2",
      "kind": "crane",
      "name": "往返起重吊台",
      "decks": [
        "machine-hoist-2-left"
      ],
      "lowY": 4440,
      "highY": 3820,
      "speed": 115,
      "pause": 0.9,
      "anchor": {
        "x": 8420,
        "y": 3660
      },
      "from": "machine-landing-1-4",
      "to": "machine-machine-hoist-2-upper-dock",
      "authoredClearance": true
    },
    {
      "id": "machine-hoist-3",
      "kind": "crane",
      "name": "往返起重吊台",
      "decks": [
        "machine-hoist-3-left"
      ],
      "lowY": 2320,
      "highY": 1700,
      "speed": 115,
      "pause": 0.9,
      "anchor": {
        "x": 1170,
        "y": 1540
      },
      "from": "machine-landing-3-0",
      "to": "machine-machine-hoist-3-upper-dock",
      "authoredClearance": true
    },
    {
      "id": "machine-hoist-4",
      "kind": "pulley",
      "name": "双篮平衡滑轮",
      "decks": [
        "machine-hoist-4-left",
        "machine-hoist-4-right"
      ],
      "lowY": 3330,
      "highY": 3030,
      "speed": 95,
      "pause": 1.1,
      "anchor": {
        "x": 1360,
        "y": 2690
      },
      "from": "machine-landing-1-0",
      "to": "machine-machine-hoist-4-exit",
      "authoredClearance": true
    },
    {
      "id": "machine-hoist-5",
      "kind": "pulley",
      "name": "双篮平衡滑轮",
      "decks": [
        "machine-hoist-5-left",
        "machine-hoist-5-right"
      ],
      "lowY": 3150,
      "highY": 2850,
      "speed": 95,
      "pause": 1.1,
      "anchor": {
        "x": 5510,
        "y": 2510
      },
      "from": "machine-landing-2-2",
      "to": "machine-machine-hoist-5-exit",
      "authoredClearance": true
    },
    {
      "id": "machine-hoist-6",
      "kind": "pulley",
      "name": "冷凝塔双篮天平",
      "decks": [
        "machine-east-balcony",
        "machine-east-sign"
      ],
      "lowY": 3780,
      "highY": 3480,
      "speed": 95,
      "pause": 1,
      "anchor": {
        "x": 8270,
        "y": 3070
      },
      "from": "machine-machine-hoist-2-upper-dock",
      "to": "machine-east-tank",
      "authoredClearance": true
    },
    {
      "id": "machine-hoist-7",
      "kind": "pulley",
      "name": "观星台运镜天平",
      "decks": [
        "machine-observatory-step-a",
        "machine-observatory-step-b"
      ],
      "lowY": 1310,
      "highY": 990,
      "speed": 95,
      "pause": 1,
      "anchor": {
        "x": 3250,
        "y": 650
      },
      "from": "machine-observatory-base",
      "to": "machine-observatory-step-c",
      "authoredClearance": true
    }
  ],
  "regions": [
    {
      "name": "到站广场",
      "x": 0,
      "y": 4000,
      "w": 2200,
      "h": 1000
    },
    {
      "name": "邮轨总站",
      "x": 2200,
      "y": 4000,
      "w": 1700,
      "h": 1000
    },
    {
      "name": "低压工坊",
      "x": 3900,
      "y": 3900,
      "w": 2400,
      "h": 1100
    },
    {
      "name": "冷凝码头",
      "x": 6300,
      "y": 3700,
      "w": 2700,
      "h": 1300
    },
    {
      "name": "齿轮街",
      "x": 1000,
      "y": 3300,
      "w": 2200,
      "h": 700
    },
    {
      "name": "旧钟楼",
      "x": 0,
      "y": 2000,
      "w": 1600,
      "h": 2000
    },
    {
      "name": "双篮街",
      "x": 1600,
      "y": 2600,
      "w": 2200,
      "h": 700
    },
    {
      "name": "铆钉检修坪",
      "x": 3780,
      "y": 2450,
      "w": 1600,
      "h": 620
    },
    {
      "name": "空中检修桥",
      "x": 5350,
      "y": 2300,
      "w": 2100,
      "h": 1100
    },
    {
      "name": "镜面车间",
      "x": 7350,
      "y": 1750,
      "w": 1650,
      "h": 1950
    },
    {
      "name": "云上屋顶",
      "x": 1000,
      "y": 1100,
      "w": 8000,
      "h": 1200
    },
    {
      "name": "观星台",
      "x": 2500,
      "y": 200,
      "w": 1400,
      "h": 900
    }
  ],
  "cityTransports": [
    {
      "id": "machine-transfer-first",
      "a": {
        "x": 7650,
        "y": 1480
      },
      "b": {
        "x": 7870,
        "y": 850
      },
      "seconds": 5,
      "pause": 3,
      "phase": 0
    },
    {
      "id": "machine-transfer-second",
      "a": {
        "x": 8290,
        "y": 740
      },
      "b": {
        "x": 8640,
        "y": 430
      },
      "seconds": 5,
      "pause": 3,
      "phase": 0
    },
    {
      "id": "machine-pipe-lift",
      "a": {
        "x": 4270,
        "y": 4220
      },
      "b": {
        "x": 4300,
        "y": 3580
      },
      "seconds": 5,
      "pause": 2,
      "phase": 0,
      "requires": "machine-v12-pipes"
    },
    {
      "id": "machine-underpass",
      "a": {
        "x": 3160,
        "y": 4600
      },
      "b": {
        "x": 3670,
        "y": 4440
      },
      "seconds": 4,
      "pause": 2,
      "phase": 0
    },
    {
      "id": "machine-pipe-walk",
      "a": {
        "x": 4820,
        "y": 4380
      },
      "b": {
        "x": 5320,
        "y": 4200
      },
      "seconds": 4,
      "pause": 2,
      "phase": 3
    },
    {
      "id": "machine-tram-roof",
      "a": {
        "x": 2600,
        "y": 3000
      },
      "b": {
        "x": 3030,
        "y": 3140
      },
      "seconds": 4,
      "pause": 2,
      "phase": 0
    },
    {
      "id": "machine-sky-post",
      "a": {
        "x": 3750,
        "y": 1580
      },
      "b": {
        "x": 4250,
        "y": 1400
      },
      "seconds": 4,
      "pause": 2,
      "phase": 2
    },
    {
      "id": "machine-gear-step",
      "a": {
        "x": 1470,
        "y": 3970
      },
      "b": {
        "x": 1540,
        "y": 3800
      },
      "seconds": 3,
      "pause": 1.5,
      "phase": 0
    },
    {
      "id": "machine-laundry-roof",
      "a": {
        "x": 570,
        "y": 3790
      },
      "b": {
        "x": 670,
        "y": 3450
      },
      "seconds": 3.5,
      "pause": 1.5,
      "phase": 1
    },
    {
      "id": "machine-copper-roof",
      "a": {
        "x": 2350,
        "y": 1400
      },
      "b": {
        "x": 2750,
        "y": 1400
      },
      "seconds": 4,
      "pause": 1.5,
      "phase": 0
    },
    {
      "id": "machine-turbine-roof",
      "a": {
        "x": 5150,
        "y": 1410
      },
      "b": {
        "x": 5600,
        "y": 1690
      },
      "seconds": 4,
      "pause": 1.5,
      "phase": 2
    },
    {
      "id": "machine-east-clock",
      "a": {
        "x": 8260,
        "y": 3260
      },
      "b": {
        "x": 8010,
        "y": 2910
      },
      "seconds": 4,
      "pause": 1.5,
      "phase": 0
    },
    {
      "id": "machine-east-lantern",
      "a": {
        "x": 7740,
        "y": 2730
      },
      "b": {
        "x": 8030,
        "y": 2390
      },
      "seconds": 4,
      "pause": 1.5,
      "phase": 1
    }
  ]
}; (root.WIND_EXPANSIONS ||= {}).machine=world;})(typeof window==='undefined'?globalThis:window);
