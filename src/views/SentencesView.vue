<script setup lang="ts">
/**
 * /sentences —— 全部 423 条。
 * 单栏引文流，分批追加。检索是纯前端 includes，不引索引库。
 * 命中不上高亮色：标记只加粗、改成主文字色，没有背景色。
 */
import { computed } from 'vue'
import SentenceStream from '@/components/SentenceStream.vue'
import RandomSentence from '@/components/RandomSentence.vue'
import { useSentences } from '@/composables/useSentences'

const { stats, loaded, failed, query, debounced, matched, visible, exhausted, more } =
  useSentences()

const countText = computed(() => {
  if (!loaded.value) return ''
  if (debounced.value) return `${matched.value.length} / ${stats.value?.total ?? 0} 条`
  return `${stats.value?.total ?? 0} 条`
})
</script>

<template>
  <main id="main" class="page">
    <div class="section wrap sv__head">
      <h1 class="title">书摘</h1>
      <p class="body measure sv__intro">
        原作者从《三体》里抄下来的句子。长短差得很远，最短五个字，最长三百多字，
        所以它们在这里也占不一样大的地方。
      </p>

      <div class="sv__pick">
        <RandomSentence />
      </div>
    </div>

    <!--
      检索条吸在顶部：翻到第 50 条想换个词，不用先滚回页首。
      它必须是 main 的直接子元素——留在 .sv__head 里的话，sticky 的范围只有页头那么高，
      页头滚出视口时它就跟着走了。
    -->
    <div class="sv__bar">
      <div class="wrap">
        <div class="sv__search">
          <label class="fine sv__label" for="sv-q">搜句子</label>
          <input
            id="sv-q"
            v-model="query"
            class="sv__input"
            type="search"
            autocomplete="off"
            placeholder="输入一个词"
          />
          <p class="fine sv__count" aria-live="polite">{{ countText }}</p>
        </div>
      </div>
    </div>

    <div class="section wrap sv__stream">
      <SentenceStream
        :items="visible"
        :highlight="debounced"
        :exhausted="exhausted"
        :loaded="loaded"
        :failed="failed"
        @more="more"
      />
    </div>
  </main>
</template>

<style scoped>
.sv__intro {
  margin-top: var(--s-4);
}

.sv__pick {
  margin-top: var(--s-6);
}

/*
  吸顶的检索条。底色只能用 --void：全站只有一个背景色，
  书摘从它下面滚过去时被这一整块黑挡住，不需要投影也不需要毛玻璃。
  下沿那条 1px 用 --ink-2，和站内其它分隔线同一档。
*/
.sv__bar {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--void);
  padding: var(--s-3) var(--s-4);
  border-bottom: 1px solid var(--ink-2);
}

.sv__search {
  display: grid;
  gap: var(--s-2);
  max-width: 24em;
}

.sv__label {
  color: var(--ink-1);
}

/* 输入框：1px 描边和圆角写在同一个盒子上 */
.sv__input {
  width: 100%;
  padding: var(--s-2) var(--s-3);
  border: 1px solid var(--ink-2);
  border-radius: var(--r);
  background: var(--void);
  color: var(--ink-0);
  /* deslop-ignore-next-line 07 08 · 输入框里显示的是书摘检索词，跟正文同一套字 */
  font-family: var(--font-serif);
  font-size: var(--t-body);
  line-height: 1.6;
  transition: border-color var(--dur-hover) var(--ease);
}

.sv__input:hover,
.sv__input:focus {
  border-color: var(--ink-0);
}

.sv__input::placeholder {
  color: var(--ink-2);
}

/*
  type="search" 自带那个清除叉是深灰的，在纯黑底上几乎看不见，
  而这是全站唯一需要它的输入框。去掉默认外观，用 --ink-1 重画一根 1px 的叉。
*/
.sv__input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  cursor: pointer;
  background-color: var(--ink-1);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M1.6 1.6 L10.4 10.4 M10.4 1.6 L1.6 10.4' stroke='%23000' stroke-width='1.6' fill='none'/%3E%3C/svg%3E")
    center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M1.6 1.6 L10.4 10.4 M10.4 1.6 L1.6 10.4' stroke='%23000' stroke-width='1.6' fill='none'/%3E%3C/svg%3E")
    center / contain no-repeat;
}

.sv__input:hover::-webkit-search-cancel-button {
  background-color: var(--ink-0);
}

.sv__count {
  color: var(--ink-1);
}
</style>
