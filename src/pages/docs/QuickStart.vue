<script setup lang="ts">
import CodeBlock from '../../components/CodeBlock.vue'
import DocContainer from '../../components/DocContainer.vue'
</script>

<template>
  <div>
    <h1>快速开始<a class="header-anchor" href="#quickstart" aria-label="Permalink"></a></h1>

    <h2>1. 克隆与安装<a class="header-anchor" href="#clone-install" aria-label="Permalink"></a></h2>
    <CodeBlock lang="bash" :tabs="['pnpm', 'npm', 'yarn']">pnpm install
===
npm install
===
yarn install</CodeBlock>

    <h2>2. 配置<a class="header-anchor" href="#config-setup" aria-label="Permalink"></a></h2>
    <CodeBlock lang="bash"># 复制示例配置
cp data/config.example.json data/config.json

# 编辑配置（填入你的 API Key）
# 修改 data/config.json 中的 providers 和 models</CodeBlock>

    <h2>3. 启动服务<a class="header-anchor" href="#start" aria-label="Permalink"></a></h2>
    <CodeBlock lang="bash"># 开发模式
npm run dev

# 生产模式
npm start
# 服务默认运行在 http://localhost:8787</CodeBlock>

    <DocContainer type="tip">
      启动后访问 <code>http://localhost:8787</code> 即可看到管理界面，默认登录密码是 <code>admin</code>。
    </DocContainer>
  </div>
</template>
