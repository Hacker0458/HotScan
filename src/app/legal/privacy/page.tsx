/**
 * 隐私政策页面
 * 
 * 用户数据收集和使用说明
 */

import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: '隐私政策 | HotScan 热点雷达',
  description: 'HotScan 隐私政策和数据保护说明',
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="隐私政策" lastUpdated="2024年1月1日">
      <div className="space-y-8 text-slate-300">
        {/* 概述 */}
        <section className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">📋 隐私保护承诺</h2>
          <ul className="space-y-2 text-blue-300">
            <li>• 我们<strong>重视并保护</strong>您的个人隐私</li>
            <li>• 仅收集<strong>必要的用户数据</strong>用于功能实现和服务改进</li>
            <li>• <strong>不会出售</strong>您的个人信息给第三方</li>
            <li>• 您有权随时<strong>查看、导出、删除</strong>您的数据</li>
            <li>• 我们遵守GDPR、CCPA等数据保护法规</li>
          </ul>
        </section>

        {/* 1. 数据收集 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. 我们收集哪些数据</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">1.1 功能性数据</h3>
            <p>为实现核心功能，我们收集以下数据：</p>
            
            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <h4 className="font-semibold text-slate-200 mb-2">账户信息</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>邮箱地址（用于登录和通知）</li>
                <li>用户ID（系统自动生成）</li>
                <li>创建时间</li>
              </ul>
              <p className="text-sm text-yellow-400 mt-2">
                ℹ️ 我们使用NextAuth进行身份验证，不存储您的密码。
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <h4 className="font-semibold text-slate-200 mb-2">订阅和书签</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>订阅的资产标签（如"BTC_Alerts"）</li>
                <li>收藏的术语和信号</li>
                <li>自定义设置</li>
              </ul>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <h4 className="font-semibold text-slate-200 mb-2">生成的内容</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>分享海报记录（图片、标题、指标）</li>
                <li>RAG问答历史（仅保留30天）</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">1.2 统计和分析数据</h3>
            <p>为改进服务质量，我们使用以下工具收集<strong>匿名或假名化</strong>的数据：</p>
            
            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <h4 className="font-semibold text-slate-200 mb-2">PostHog（产品分析）</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>页面浏览记录（URL、停留时间）</li>
                <li>功能使用统计（点击、查看、分享）</li>
                <li>设备信息（浏览器、操作系统、屏幕尺寸）</li>
                <li>用户行为路径（匿名化）</li>
              </ul>
              <p className="text-sm text-slate-400 mt-2">
                PostHog数据存储在<strong>欧盟数据中心</strong>，遵守GDPR。
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <h4 className="font-semibold text-slate-200 mb-2">Sentry（错误监控）</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>错误日志（类型、堆栈、时间）</li>
                <li>性能指标（API响应时间、页面加载速度）</li>
                <li>用户上下文（假名化ID，不包含邮箱）</li>
              </ul>
              <p className="text-sm text-slate-400 mt-2">
                Sentry日志仅保留<strong>30天</strong>，不包含敏感信息。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">1.3 我们<strong className="text-red-400">不收集</strong>的数据</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-green-300">
              <li>✅ 不收集您的密码（使用NextAuth无密码登录）</li>
              <li>✅ 不收集您的钱包地址或私钥</li>
              <li>✅ 不收集您的交易记录</li>
              <li>✅ 不收集您的财务信息</li>
              <li>✅ 不追踪您在其他网站的行为</li>
            </ul>
          </div>
        </section>

        {/* 2. 数据使用 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. 我们如何使用数据</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">2.1 核心功能</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>提供信号推送、术语问答等服务</li>
              <li>保存您的订阅和收藏</li>
              <li>生成和分享个性化海报</li>
              <li>发送通知和提醒（需您授权）</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">2.2 服务改进</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>分析功能使用情况，优化用户体验</li>
              <li>识别和修复技术问题</li>
              <li>评估新功能的效果</li>
              <li>优化性能和响应速度</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">2.3 合规和安全</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>防止欺诈、滥用和攻击</li>
              <li>遵守法律法规要求</li>
              <li>保护平台和用户安全</li>
            </ul>
          </div>
        </section>

        {/* 3. 第三方服务 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. 第三方服务和SDK</h2>
          <div className="space-y-4">
            <p>本平台集成以下第三方服务，它们可能收集和处理您的数据：</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="border border-slate-600 p-3 text-left">服务名称</th>
                    <th className="border border-slate-600 p-3 text-left">用途</th>
                    <th className="border border-slate-600 p-3 text-left">数据类型</th>
                    <th className="border border-slate-600 p-3 text-left">隐私政策</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-600 p-3"><strong>Vercel</strong></td>
                    <td className="border border-slate-600 p-3">托管和CDN</td>
                    <td className="border border-slate-600 p-3">IP地址、请求日志</td>
                    <td className="border border-slate-600 p-3">
                      <a href="https://vercel.com/legal/privacy-policy" target="_blank" className="text-blue-400 hover:underline">
                        查看
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 p-3"><strong>Neon/Supabase</strong></td>
                    <td className="border border-slate-600 p-3">数据库</td>
                    <td className="border border-slate-600 p-3">用户数据（加密存储）</td>
                    <td className="border border-slate-600 p-3">
                      <a href="https://neon.tech/privacy-policy" target="_blank" className="text-blue-400 hover:underline">
                        查看
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 p-3"><strong>OpenAI</strong></td>
                    <td className="border border-slate-600 p-3">AI分析和问答</td>
                    <td className="border border-slate-600 p-3">查询内容（不保存）</td>
                    <td className="border border-slate-600 p-3">
                      <a href="https://openai.com/policies/privacy-policy" target="_blank" className="text-blue-400 hover:underline">
                        查看
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 p-3"><strong>PostHog</strong></td>
                    <td className="border border-slate-600 p-3">产品分析</td>
                    <td className="border border-slate-600 p-3">行为数据（匿名化）</td>
                    <td className="border border-slate-600 p-3">
                      <a href="https://posthog.com/privacy" target="_blank" className="text-blue-400 hover:underline">
                        查看
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 p-3"><strong>Sentry</strong></td>
                    <td className="border border-slate-600 p-3">错误监控</td>
                    <td className="border border-slate-600 p-3">错误日志（脱敏）</td>
                    <td className="border border-slate-600 p-3">
                      <a href="https://sentry.io/privacy/" target="_blank" className="text-blue-400 hover:underline">
                        查看
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 p-3"><strong>CoinGecko</strong></td>
                    <td className="border border-slate-600 p-3">价格数据源</td>
                    <td className="border border-slate-600 p-3">仅服务端调用</td>
                    <td className="border border-slate-600 p-3">
                      <a href="https://www.coingecko.com/en/privacy" target="_blank" className="text-blue-400 hover:underline">
                        查看
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-yellow-400 mt-4">
              ℹ️ 这些第三方服务有自己的隐私政策，我们建议您阅读并了解它们的数据处理方式。
            </p>
          </div>
        </section>

        {/* 4. 数据保护 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. 数据安全保护</h2>
          <div className="space-y-4">
            <p>我们采取以下措施保护您的数据安全：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>传输加密</strong>：所有数据通过HTTPS/TLS加密传输</li>
              <li><strong>存储加密</strong>：敏感数据在数据库中加密存储</li>
              <li><strong>访问控制</strong>：严格的权限管理，最小化数据访问</li>
              <li><strong>定期备份</strong>：每日自动备份，保留30天</li>
              <li><strong>安全审计</strong>：定期进行安全漏洞扫描</li>
              <li><strong>日志保留</strong>：安全日志保留90天</li>
            </ul>
          </div>
        </section>

        {/* 5. 您的权利 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. 您的数据权利</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">5.1 查看数据</h3>
            <p>
              您可以随时登录账户，查看我们收集的个人数据。
            </p>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">5.2 导出数据</h3>
            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <p className="mb-2">导出您的所有数据：</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>登录账户</li>
                <li>进入"设置" → "隐私"</li>
                <li>点击"导出我的数据"</li>
                <li>我们将在<strong>48小时内</strong>通过邮件发送数据包（JSON格式）</li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">5.3 删除数据</h3>
            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <p className="mb-2">永久删除您的账户和数据：</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>登录账户</li>
                <li>进入"设置" → "账户"</li>
                <li>点击"删除账户"</li>
                <li>确认删除（<strong>不可恢复</strong>）</li>
              </ol>
              <p className="text-red-400 mt-4">
                ⚠️ 删除后，以下数据将被永久清除：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>账户信息（邮箱、ID）</li>
                <li>订阅和书签</li>
                <li>生成的海报</li>
                <li>RAG问答历史</li>
              </ul>
              <p className="text-yellow-400 mt-4">
                ℹ️ 以下数据将被<strong>匿名化</strong>保留（用于统计）：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>PostHog分析数据（已匿名化）</li>
                <li>Sentry错误日志（30天后自动删除）</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">5.4 数据修改</h3>
            <p>
              您可以随时在"设置"页面修改您的个人信息。
            </p>

            <h3 className="text-xl font-semibold text-slate-200 mt-6">5.5 取消订阅</h3>
            <p>
              您可以随时取消邮件通知和推送订阅，不影响其他功能使用。
            </p>
          </div>
        </section>

        {/* 6. Cookies */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Cookies和追踪技术</h2>
          <div className="space-y-4">
            <p>本平台使用以下Cookies：</p>
            
            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <h4 className="font-semibold text-slate-200 mb-2">必要Cookies</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>next-auth.session-token</code>：用户登录状态（必需）</li>
                <li><code>next-auth.csrf-token</code>：安全防护（必需）</li>
              </ul>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <h4 className="font-semibold text-slate-200 mb-2">分析Cookies</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>ph_*</code>：PostHog产品分析（可选）</li>
                <li><code>sentry-session</code>：错误监控（可选）</li>
              </ul>
              <p className="text-sm text-yellow-400 mt-2">
                您可以在"设置" → "隐私"中禁用分析Cookies。
              </p>
            </div>
          </div>
        </section>

        {/* 7. 儿童隐私 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. 儿童隐私保护</h2>
          <div className="space-y-4">
            <p>
              本平台<strong>不面向13岁以下儿童</strong>。如果我们发现收集了儿童数据，将立即删除。
            </p>
            <p>
              如果您是家长，发现孩子在未经许可的情况下使用本平台，请联系我们：legal@hotscan.app
            </p>
          </div>
        </section>

        {/* 8. 政策变更 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. 隐私政策变更</h2>
          <div className="space-y-4">
            <p>
              我们可能不时更新本隐私政策。重大变更时，我们会通过以下方式通知您：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>在网站显著位置发布公告</li>
              <li>通过邮件通知（如您已注册）</li>
              <li>更新"最后更新时间"</li>
            </ul>
            <p className="mt-4">
              建议您定期查看本政策，了解最新的隐私保护措施。
            </p>
          </div>
        </section>

        {/* 9. 联系我们 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. 联系我们</h2>
          <div className="space-y-2">
            <p>如您对隐私保护有任何疑问、意见或请求，请联系我们：</p>
            <div className="bg-slate-700/30 rounded-lg p-4 mt-2">
              <ul className="space-y-2">
                <li><strong>隐私负责人：</strong>HotScan Legal Team</li>
                <li><strong>邮箱：</strong>legal@hotscan.app</li>
                <li><strong>地址：</strong>（如适用，填写实际地址）</li>
              </ul>
              <p className="mt-4 text-sm text-slate-400">
                我们将在<strong>30天内</strong>响应您的请求。
              </p>
            </div>
          </div>
        </section>

        {/* 底部声明 */}
        <section className="bg-slate-700/30 rounded-lg p-6 text-center">
          <p className="text-slate-400">
            使用本平台即表示您已阅读、理解并同意本隐私政策。
          </p>
          <p className="text-slate-400 mt-2">
            本政策最后更新于：<strong className="text-white">2024年1月1日</strong>
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}

