export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
        <h1>隐私政策</h1>
        
        <p className="text-muted-foreground">
          最后更新：{new Date().toLocaleDateString('zh-CN')}
        </p>

        <h2>1. 信息收集</h2>
        <p>
          我们收集以下类型的信息：
        </p>
        <ul>
          <li>账户信息：当您注册账户时，我们会收集您的电子邮件地址、姓名和头像（通过第三方OAuth提供商）</li>
          <li>使用数据：我们收集您如何使用我们服务的信息，包括浏览的话题、收藏的内容等</li>
          <li>设备信息：包括IP地址、浏览器类型、操作系统等</li>
        </ul>

        <h2>2. 信息使用</h2>
        <p>
          我们使用收集的信息用于：
        </p>
        <ul>
          <li>提供、维护和改进我们的服务</li>
          <li>个性化您的使用体验</li>
          <li>发送服务通知和更新</li>
          <li>分析使用趋势和偏好</li>
          <li>检测和防止欺诈或滥用行为</li>
        </ul>

        <h2>3. 信息共享</h2>
        <p>
          我们不会出售您的个人信息。我们只在以下情况下共享您的信息：
        </p>
        <ul>
          <li>征得您的同意</li>
          <li>为了提供服务（如第三方服务提供商）</li>
          <li>遵守法律要求</li>
          <li>保护我们的权利和安全</li>
        </ul>

        <h2>4. 数据安全</h2>
        <p>
          我们采用行业标准的安全措施来保护您的个人信息，包括：
        </p>
        <ul>
          <li>加密传输（HTTPS/TLS）</li>
          <li>访问控制和身份验证</li>
          <li>定期安全审计</li>
          <li>数据备份和灾难恢复</li>
        </ul>

        <h2>5. Cookie和追踪技术</h2>
        <p>
          我们使用Cookie和类似技术来：
        </p>
        <ul>
          <li>保持您的登录状态</li>
          <li>记住您的偏好设置</li>
          <li>分析网站流量和使用情况</li>
          <li>提供个性化内容</li>
        </ul>

        <h2>6. 您的权利</h2>
        <p>
          您有权：
        </p>
        <ul>
          <li>访问和更新您的个人信息</li>
          <li>删除您的账户和数据</li>
          <li>选择退出某些数据收集</li>
          <li>导出您的数据</li>
        </ul>

        <h2>7. 儿童隐私</h2>
        <p>
          我们的服务不面向13岁以下的儿童。我们不会故意收集儿童的个人信息。
        </p>

        <h2>8. 政策更新</h2>
        <p>
          我们可能会不时更新本隐私政策。重大变更将通过电子邮件或网站通知您。
        </p>

        <h2>9. 联系我们</h2>
        <p>
          如有任何关于隐私政策的问题，请通过以下方式联系我们：
        </p>
        <ul>
          <li>电子邮件：privacy@hotscan.example.com</li>
          <li>地址：[您的公司地址]</li>
        </ul>
      </div>
    </div>
  )
}
