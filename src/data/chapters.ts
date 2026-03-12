export interface Chapter {
  id: number;
  title: string;
  desc: string;
  vocabIds: string[];
}

export const chapters: Chapter[] = [
  {
    id: 1,
    title: '冒險的起點',
    desc: '真新鎮出發！認識基礎介面與寶可夢',
    vocabIds: [
      'loc_001', // 真新鎮
      'dlg_001', // 大木博士
      'dlg_008', // 冒險
      'ui_007', // 報告（儲存）
      'pokemon_001', // 妙蛙種子
      'pokemon_004', // 小火龍
      'pokemon_007', // 傑尼龜
      'dlg_010', // 就決定是你了！
      'type_004', // 草
      'type_002', // 火
      'type_003', // 水
      'battle_005', // 野生的○○出現了！
      'move_001', // 撞擊
      'move_002', // 叫聲
    ],
  },
  {
    id: 2,
    title: '草叢的危機',
    desc: '了解對戰知識與基礎道具',
    vocabIds: [
      'loc_002', // 常磐市
      'dlg_002', // 草叢
      'dlg_009', // 寶可夢訓練家
      'loc_016', // 寶可夢中心
      'pokemon_019', // 小拉達
      'pokemon_016', // 波波
      'item_001', // 傷藥
      'item_006', // 精靈球
      'dlg_019', // 短褲少年
      'dlg_013', // 四目相交！來對戰吧！
      'battle_008', // 戰鬥
      'battle_009', // 逃跑
      'battle_010', // 攻擊
      'battle_019', // 捕捉到了○○！
      'ui_006', // 背包
    ],
  },
  {
    id: 3,
    title: '常磐森林的考驗',
    desc: '遇見蟲系寶可夢與異常狀態',
    vocabIds: [
      'loc_011', // 常磐森林
      'dlg_020', // 捕蟲少年
      'pokemon_010', // 綠毛蟲
      'pokemon_025', // 皮卡丘
      'move_031', // 吐絲
      'move_006', // 電擊
      'type_012', // 蟲
      'type_005', // 電
      'status_001', // 中毒
      'status_002', // 麻痺
      'item_018', // 解毒藥
      'item_019', // 解麻藥
      'battle_001', // 效果絕佳
      'battle_015', // 似乎沒有效果
      'battle_020', // 獲得了經驗值！
    ],
  },
  {
    id: 4,
    title: '岩石防禦',
    desc: '挑戰尼比市道館館主小剛',
    vocabIds: [
      'loc_003', // 尼比市
      'dlg_003', // 道館館主
      'dlg_014', // 放馬過來！
      'pokemon_074', // 小拳石
      'pokemon_095', // 大岩蛇
      'type_013', // 岩石
      'type_009', // 地面
      'move_037', // 守住
      'move_013', // 綁緊
      'ui_014', // 道館徽章
      'dlg_015', // 輸了……
      'ui_012', // 技能機
      'ui_001', // 查看能力
    ],
  },
  {
    id: 5,
    title: '神秘的月見山',
    desc: '穿越山洞與火箭隊初遭遇',
    vocabIds: [
      'loc_012', // 月見山
      'pokemon_041', // 超音蝠
      'pokemon_035', // 皮皮
      'pokemon_079', // 呆呆獸
      'type_014', // 鬼
      'type_008', // 毒
      'dlg_006', // 火箭隊
      'dlg_007', // 小兵
      'item_005', // 活力碎片
      'item_011', // 城鎮地圖
      'battle_003', // 擊中要害
      'battle_016', // 進化了！
      'ui_005', // 同行寶可夢
    ],
  },
];
