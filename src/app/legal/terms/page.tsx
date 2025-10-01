/**
 * 服务条款页面
 * 
 * 法律声明和使用条款
 */

import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: '服务条款 | HotScan 热点雷达',
  description: 'HotScan 服务条款和使用协议',
}

export default function TermsPage() {
  return (
    <LegalLayout title="服务条款" lastUpdated="2024年1月1日">
      <div className="space-y-8 text-slate-300">
        {/* 重要声明 */}
        <section className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ 重要声明</h2>
          <ul className="space-y-2 text-red-300">
            <li>• <strong>本平台仅提供信息展示服务</strong>，不提供任何买卖、交易功能</li>
            <li>• <strong>所有内容均非投资建议</strong>，不构成任何投资推荐</li>
            <li>• <strong>不做任何收益承诺</strong>，不保证任何投资回报</li>
            <li>• <strong>加密货币投资存在高风险</strong>，您可能损失全部投资</li>
            <li>• 请在充分了解风险的基础上，理性、谨慎地做出投资决策</li>
          </ul>
        </section>

        {/* 1. 服务定义 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. 服务定义</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">1.1 服务性质</h3>
            <p>
              HotScan（以下简称"本平台"）是一个<strong>信息聚合和展示平台</strong>，旨在为用户提供：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>加密货币市场数据聚合</li>
              <li>链上数据分析与可视化</li>
              <li>AI驱动的市场趋势解读</li>
              <li>金融术语教育内容（RAG问答）</li>
              <li>数据分享与导出功能</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">1.2 服务限制</h3>
            <p>本平台<strong>不提供</strong>以下服务：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>❌ 加密货币买卖、交易功能</li>
              <li>❌ 资产托管、钱包服务</li>
              <li>❌ 投资咨询、理财规划</li>
              <li>❌ 收益承诺、回报保证</li>
              <li>❌ 任何形式的金融中介服务</li>
            </ul>
          </div>
        </section>

        {/* 2. 免责声明 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. 免责声明</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">2.1 非投资建议</h3>
            <p>
              本平台提供的所有信息、数据、分析、解读，<strong>均仅供参考，不构成任何投资建议</strong>。
              我们不对任何基于本平台信息做出的投资决策负责。
            </p>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">2.2 数据准确性</h3>
            <p>
              虽然我们努力提供准确、及时的数据，但<strong>不保证数据的完全准确性、完整性或实时性</strong>。
              可能存在以下情况：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>数据延迟（最多可能延迟5-15分钟）</li>
              <li>数据源错误或不一致</li>
              <li>网络故障导致的数据缺失</li>
              <li>第三方API服务中断</li>
              <li>算法计算误差</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">2.3 风险提示</h3>
            <p>
              加密货币投资存在<strong>极高风险</strong>，包括但不限于：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>价格剧烈波动（可能在短时间内归零）</li>
              <li>市场操纵（拉高出货、Rug Pull）</li>
              <li>技术风险（智能合约漏洞、黑客攻击）</li>
              <li>流动性风险（无法及时买卖）</li>
              <li>监管风险（政策变化、法律限制）</li>
            </ul>
            <p className="mt-4 font-bold text-red-400">
              请您在充分了解风险的基础上，谨慎决策，切勿投入超出承受能力的资金。
            </p>
          </div>
        </section>

        {/* 3. 数据来源 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. 数据来源</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">3.1 第三方数据提供商</h3>
            <p>本平台的数据来源包括但不限于：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>价格数据</strong>：CoinGecko, CoinMarketCap, Binance, Coinbase</li>
              <li><strong>链上数据</strong>：Etherscan, BSCScan, Solscan, Dune Analytics</li>
              <li><strong>交易对数据</strong>：Uniswap, PancakeSwap, SushiSwap, Raydium</li>
              <li><strong>股票数据</strong>：Alpha Vantage, Yahoo Finance（如适用）</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">3.2 数据处理</h3>
            <p>
              我们对原始数据进行以下处理：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>数据清洗和去重</li>
              <li>统计分析（Z-Score、波动率等）</li>
              <li>AI模型解读（使用OpenAI GPT-4）</li>
              <li>风险评分计算</li>
            </ul>
            <p className="mt-4 text-yellow-400">
              ⚠️ 数据处理过程可能引入误差，结果仅供参考。
            </p>
          </div>
        </section>

        {/* 4. 使用限制 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. 使用限制</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">4.1 禁止行为</h3>
            <p>使用本平台时，您<strong>不得</strong>：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>❌ 将本平台信息作为投资决策的唯一依据</li>
              <li>❌ 向他人提供投资建议或推荐</li>
              <li>❌ 抓取、爬虫或批量下载本平台数据</li>
              <li>❌ 反向工程、破解本平台技术</li>
              <li>❌ 恶意攻击、滥用API接口</li>
              <li>❌ 传播虚假信息、操纵市场</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">4.2 API限流</h3>
            <p>
              为保证服务质量，本平台实施以下限流措施：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>匿名用户：每小时最多100次请求</li>
              <li>注册用户：每小时最多1000次请求</li>
              <li>超出限制将返回429错误</li>
            </ul>
          </div>
        </section>

        {/* 5. 知识产权 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. 知识产权</h2>
          <div className="space-y-4">
            <p>
              本平台的源代码、UI设计、Logo、文档等，<strong>受MIT许可证保护</strong>。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>✅ 允许个人学习和研究</li>
              <li>✅ 允许在遵守许可证的前提下商业使用</li>
              <li>❌ 禁止去除版权声明</li>
              <li>❌ 禁止声称为原创作品</li>
            </ul>
          </div>
        </section>

        {/* 6. 服务变更与终止 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. 服务变更与终止</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">6.1 服务变更</h3>
            <p>
              我们保留随时修改、暂停或终止部分或全部服务的权利，<strong>无需事先通知</strong>。
            </p>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">6.2 账户终止</h3>
            <p>
              如您违反本条款，我们有权立即终止您的账户，无需承担任何责任。
            </p>
          </div>
        </section>

        {/* 7. 责任限制 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. 责任限制</h2>
          <div className="space-y-4">
            <p>
              在法律允许的最大范围内，本平台<strong>不承担</strong>以下责任：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>因使用本平台信息导致的投资损失</li>
              <li>因数据错误、延迟、缺失导致的任何损失</li>
              <li>因服务中断、故障导致的损失</li>
              <li>因第三方服务（数据源、API）故障导致的损失</li>
              <li>因不可抗力（自然灾害、战争、政策变化等）导致的损失</li>
            </ul>
            <p className="mt-4 font-bold text-red-400">
              您对本平台的使用风险由您自行承担。
            </p>
          </div>
        </section>

        {/* 8. 法律适用 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. 法律适用</h2>
          <div className="space-y-4">
            <p>
              本条款受<strong>中华人民共和国法律</strong>管辖（不包括其冲突法规则）。
            </p>
            <p>
              如发生争议，双方应友好协商解决；协商不成的，提交本平台所在地人民法院管辖。
            </p>
          </div>
        </section>

        {/* 9. 联系方式 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. 联系方式</h2>
          <div className="space-y-2">
            <p>如您对本条款有任何疑问，请联系我们：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>邮箱：legal@hotscan.app</li>
              <li>网站：https://hotscan.app</li>
            </ul>
          </div>
        </section>

        {/* 底部声明 */}
        <section className="bg-slate-700/30 rounded-lg p-6 text-center">
          <p className="text-slate-400">
            使用本平台即表示您已阅读、理解并同意遵守本服务条款。
          </p>
          <p className="text-slate-400 mt-2">
            本条款最后更新于：<strong className="text-white">2024年1月1日</strong>
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}

