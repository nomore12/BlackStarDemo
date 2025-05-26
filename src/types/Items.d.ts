// 아이템의 기본적인 공통 속성
interface BaseItem {
  id: string; // 아이템 고유 ID
  name: string; // UI에 표시될 아이템 이름
  description: string; // 아이템 상세 설명
  iconPath?: string; // 인벤토리 등에 표시될 아이콘 이미지 경로
  //   stackable?: boolean; // 겹치기 가능 여부 (기본값: false)
  //   maxStack?: number; // 최대 겹치기 개수 (stackable이 true일 때)
}

// 무기 아이템 타입
interface WeaponItem extends BaseItem {
  itemType: 'weapon';
  weaponType: 'melee' | 'ranged' | 'thrown'; // 무기 종류
  damageBonus?: number; // 추가 피해량
  apCostModifier?: number; // AP 소모량 보정치 (음수면 감소)
  // 사거리, 명중률 보정 등 추가 가능
}

// 소모품 아이템 타입
interface ConsumableItem extends BaseItem {
  itemType: 'consumable';
  useEffect: string; // 사용 시 발동될 효과 ID (예: 'HEAL_HP', 'RESTORE_SANITY')
  effectValue?: number; // 효과 수치 (예: 회복량)
  duration?: number; // 효과 지속 시간 (턴 또는 초 단위, 0이면 즉시)
}

// 퀘스트 또는 단서 아이템 타입
interface QuestItem extends BaseItem {
  itemType: 'quest';
  isKeyItem?: boolean; // 스토리 진행에 필수적인 '키' 아이템인지 여부
  relatedQuestId?: string; // 관련된 퀘스트 ID
}

// 기타 장비 아이템 (예: 장신구)
interface EquipmentItem extends BaseItem {
  itemType: 'equipment';
  slot: 'trinket' | 'armor'; // 장착 부위
  passiveEffects?: Array<{ effectId: string; value: number }>; // 지속 효과 목록
}

// 모든 아이템 타입을 통합하는 유니온 타입
declare type Item = WeaponItem | ConsumableItem | QuestItem | EquipmentItem;

// 인벤토리에서 아이템을 관리하기 위한 인터페이스 (예시)
declare interface InventorySlot {
  item: Item | null; // 해당 슬롯의 아이템 (없으면 null)
  quantity: number; // 아이템 수량
}
