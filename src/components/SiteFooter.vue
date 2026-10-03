<script setup lang="ts">
/**
 * 页脚。一行小字，不做三列 footer。
 * 版权说明必须写清楚：本站是粉丝二创，非官方；著作权归属。
 * 书摘出处在 /about 里交代（含仓库链接与清洗说明），这里不再重复一遍。
 */
/** 站点与书摘数据的原作者。署名不因换维护者而消失 */
const ORIGINAL_AUTHOR_URL = 'https://seir.in'
/** 现在的维护者 */
const OWNER_URL = 'https://homepage.seeker-lorraine.cn'
const REPO_URL = 'https://github.com/seeker-lorraine/Threebody.space'
</script>

<template>
  <footer class="foot">
    <div class="wrap">
      <p class="fine foot__line">
        Threebody.space · 原作者
        <a :href="ORIGINAL_AUTHOR_URL" rel="noopener noreferrer" target="_blank">綾川星凛</a>
        · 站主
        <a :href="OWNER_URL" rel="noopener noreferrer" target="_blank">seeker-lorraine</a>
        · 本站为粉丝二创，非官方 ·
        <RouterLink to="/guestbook">留言</RouterLink>
        ·
        <a :href="REPO_URL" rel="noopener noreferrer" target="_blank">源码</a>
      </p>
      <p class="fine foot__line">
        《三体》著作权归刘慈欣；《我的三体》系列相关权利归其权利人。本站不托管、不内嵌任何影片，
        动画只提供官方平台外链。
      </p>
      <p class="fine foot__line">侵权或勘误请联系站主。</p>
    </div>
  </footer>
</template>

<style scoped>
.foot {
  padding: var(--s-6) var(--s-4) var(--s-5);
}

.foot__line {
  max-width: 52em;
  color: var(--ink-1);
}

.foot__line + .foot__line {
  margin-top: var(--s-3);
}
</style>
