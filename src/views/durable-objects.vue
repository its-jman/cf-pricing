<template>
  <div class="text-white">
    <div>
      <o-field label="How many web sockets active at once?" message="">
        <o-input type="number" v-model="wss" :min="0" />
      </o-field>
      <o-field
        label="How many hours per day is each web socket active?"
        message=""
      >
        <o-input type="number" v-model="connHoursPerDay" :min="0" />
      </o-field>
      <o-field
        label="Percentage of web sockets connecting to unique Durable Objects?"
        message=""
      >
        <o-slider
          type="number"
          v-model="wsToDoPercentage"
          :max="100"
          :min="0"
          :step="5"
          :custom-formatter="(val) => val + '%'"
        />
      </o-field>
      <o-field label="Messages per minute?" message="">
        <o-input type="number" v-model="msgsPerMin" :max="10000" :min="0" />
      </o-field>
      <o-field label="Compute duration per message (in ms)?" message="">
        <o-input
          type="number"
          v-model="computeMsPerMsg"
          :max="10000"
          :min="0"
        />
      </o-field>
      <div class="grid grid-cols-2">
        <div>
          <h3 class="text-lg font-bold">Cloudflare</h3>
          <div>GB-s price: {{ cfGbsPrice.toFixed(2) }}</div>
          <div class="font-bold">Total: ${{ cfTotal.toFixed(2) }}</div>
        </div>
        <div>
          <h3 class="text-lg font-bold">AWS</h3>
          <div>WS duration price: {{ awsWsDurationPrice.toFixed(2) }}</div>
          <div>Message price: ${{ awsWsMsgPrice.toFixed(2) }}</div>
          <div>GB-s price: ${{ awsLambdaPrice.toFixed(2) }}</div>
          <div class="font-bold">Total: ${{ awsTotal.toFixed(2) }}</div>
        </div>
      </div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const CLOUDFLARE_PRICING = {
  per1MGbS: 12.5,
  per1MReq: 0.15,
  freeGbS: 400_000,
};

const AWS_PRICING = {
  per1MMins: 0.25,
  per1MMsg: 1,
  per1MGbS: 13.33,
};

const wss = $ref(100);
const connHoursPerDay = $ref(8);
const wsToDoPercentage = $ref(50);

const msgsPerMin = $ref(12);
const computeMsPerMsg = $ref(3);

const setExample = (id) => () => {
  const vals = examples[id];
  if (!vals) {
    console.error("No example found");
    return;
  }
  wss = vals.wss;
  connHoursPerDay = vals.connHoursPerDay;
  wsToDoPercentage = vals.wsToDoPercentage;
  msgsPerMin = vals.msgsPerMin;
  computeMsPerMsg = vals.computeMsPerMsg;
};

const msgsPerUserPerDay = $computed(
  () => msgsPerMin * 60 /* minutes */ * connHoursPerDay
);
const totalMsgs = $computed(() => msgsPerUserPerDay * wss);

const doCount = $computed(() => wss * (wsToDoPercentage / 100));
const cfCompute128S = $computed(
  () => doCount * connHoursPerDay * 60 /* mins */ * 60 /* seconds */
);
const cfPartialFreeComputeGbS = $computed(() => cfCompute128S / 8);
const paidComputeGbS = $computed(() =>
  Math.max(0, cfPartialFreeComputeGbS - CLOUDFLARE_PRICING.freeGbS)
);
const cfGbsPrice = $computed(
  () => (CLOUDFLARE_PRICING.per1MGbS / 1_000_000) * paidComputeGbS
);

const cfTotal = $computed(() => Math.max(5, cfGbsPrice));

const awsWsDurationPrice = $computed(
  () =>
    (AWS_PRICING.per1MMins / 1_000_000) * ((wss * connHoursPerDay) / 24 / 60)
);
const awsWsMsgPrice = $computed(
  () => (AWS_PRICING.per1MMsg / 1_000_000) * totalMsgs
);
const awsLambdaPrice = $computed(() => {
  const pricePerGbS = AWS_PRICING.per1MGbS / 1_000_000;
  const computeMs = totalMsgs * computeMsPerMsg;
  const computeGbS = computeMs / 1000 / 8;
  return pricePerGbS * computeGbS;
});

const awsTotal = $computed(
  () => awsWsDurationPrice + awsWsMsgPrice + awsLambdaPrice
);
</script>
