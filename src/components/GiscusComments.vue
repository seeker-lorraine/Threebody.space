<script setup lang="ts">
/**
 * giscus 留言区。
 *
 * 不使用额外的 Vue 包：giscus 官方脚本本身会创建 iframe，组件只负责在页面
 * 挂载时插入脚本、离开页面时清理。留言统一写入仓库 Discussions 的 General 分类。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 留言写在站点自己的仓库里。
 *
 * 映射是 specific + strict：整站只对应一条 Discussion，键是固定的「留言板」，
 * 与 URL、与路由模式都无关——所以单文件版那个 hash 路由也不会跑偏。
 *
 * 这条 Discussion 由 giscus 在有人首次评论时自动创建（实测如此，尽管设了 strict=1）；
 * 创建之前 /api/discussions 返回 404，留言区是空的，属正常现象。
 *
 * 建好之后：不要删、不要改标题——标题一改 giscus 就找不到，404 会重现。
 * 之后在 GitHub 上直接回复这条，页面同样会显示，反之亦然。
 */
const REPO = 'seeker-lorraine/Threebody.space'
const REPO_ID = 'R_kgDOUwQwIg'
const CATEGORY = 'General'
const CATEGORY_ID = 'DIC_kwDOUwQwIs4DG73g'

const comments = ref<HTMLElement | null>(null)

onMounted(() => {
  const host = comments.value
  if (!host) return

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', REPO)
  script.setAttribute('data-repo-id', REPO_ID)
  script.setAttribute('data-category', CATEGORY)
  script.setAttribute('data-category-id', CATEGORY_ID)
  script.setAttribute('data-mapping', 'specific')
  script.setAttribute('data-term', '留言板')
  script.setAttribute('data-strict', '1')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', 'transparent_dark')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('data-loading', 'lazy')
  host.appendChild(script)
})

onBeforeUnmount(() => {
  comments.value?.replaceChildren()
})
</script>

<template>
  <div ref="comments" class="comments">
    <noscript>
      <p class="fine">
        留言区需要 JavaScript。也可以直接前往
        <a
          href="https://github.com/seeker-lorraine/Threebody.space/discussions"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub Discussions
        </a>
        留言。
      </p>
    </noscript>
  </div>
</template>

<style scoped>
.comments {
  width: 100%;
  min-height: 240px;
}

.comments :deep(.giscus),
.comments :deep(.giscus-frame) {
  width: 100%;
}
</style>
