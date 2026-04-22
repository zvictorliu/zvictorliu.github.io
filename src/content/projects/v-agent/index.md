---
title: 基于 OpenCode 的个人 Agent 实现
startDate: 2026-01-01
endDate: 2026-04-22
ongoing: true
summary: 一个参考 OpenCode 核心框架的最小 Agent，基于 Python 编写
tags:
  - Agent Harness
repo: https://github.com/zvictorliu/v-agent
---

参考 OpenCode 的编排逻辑实现了会话管理、工具调用的 ReAct 循环、还有消息-部件分离的存储方式，与它不同的点在于一个是在 OpenCode 它依赖于 Vercel AI SDK 来和大模型交互，但我基于 Python 生态写没有这个东西，于是用上了 LangChain 做替代，主要是看中了它对 LLM 接口的封装，兼容性强，符合我作为学生并没有特别稳定的大模型供应渠道的特点，那么相应的它的 Message 格式定义、对工具的封装也就都加入了进去。
