<template>
  <div>
    <ion-icon
      v-for="n in [1, 2, 3, 4, 5]"
      :key="n"
      :icon="n <= modelValue ? star : starOutline"
      @click="$emit('update:modelValue', n)"
    >
    </ion-icon>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { star, starOutline } from 'ionicons/icons';

defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
ion-icon {
  font-size: 24px;
  padding-right: 12px;
  color: gold;
}

ion-icon:last-child {
  padding-right: 0px;
}
</style>
