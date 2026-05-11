<template>
  <span class="badge badge-sm" :class="badgeClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ASSET_STATUS_BADGE,
  ASSET_STATUS_LABEL,
  BORROW_STATUS_BADGE,
  BORROW_STATUS_LABEL,
  type AssetBusinessStatus,
  type BorrowStatus,
} from "@/utils/status";

const props = defineProps<{
  /** asset = 资产业务状态；borrow = 借用申请状态 */
  type?: "asset" | "borrow";
  status: AssetBusinessStatus | BorrowStatus;
}>();

const isAsset = (s: string): s is AssetBusinessStatus => s in ASSET_STATUS_LABEL;
const isBorrow = (s: string): s is BorrowStatus => s in BORROW_STATUS_LABEL;

const label = computed(() => {
  if (props.type === "borrow" && isBorrow(props.status)) return BORROW_STATUS_LABEL[props.status];
  if (isAsset(props.status)) return ASSET_STATUS_LABEL[props.status];
  if (isBorrow(props.status)) return BORROW_STATUS_LABEL[props.status];
  return props.status;
});

const badgeClass = computed(() => {
  if (props.type === "borrow" && isBorrow(props.status)) return BORROW_STATUS_BADGE[props.status];
  if (isAsset(props.status)) return ASSET_STATUS_BADGE[props.status];
  if (isBorrow(props.status)) return BORROW_STATUS_BADGE[props.status];
  return "badge-ghost";
});
</script>
