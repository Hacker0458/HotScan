import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">设置</h1>
          </div>
          <p className="text-muted-foreground">
            管理你的账户和偏好设置
          </p>
        </div>

        <div className="space-y-6">
          {/* 账户信息 */}
          <Card>
            <CardHeader>
              <CardTitle>账户信息</CardTitle>
              <CardDescription>你的个人信息和账户详情</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 偏好设置 */}
          <Card>
            <CardHeader>
              <CardTitle>偏好设置</CardTitle>
              <CardDescription>自定义你的使用体验</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">接收通知</p>
                    <p className="text-sm text-muted-foreground">
                      新热点话题和更新通知
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">邮件摘要</p>
                    <p className="text-sm text-muted-foreground">
                      每日热点摘要邮件
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 关注分类 */}
          <Card>
            <CardHeader>
              <CardTitle>关注的分类</CardTitle>
              <CardDescription>选择你感兴趣的话题分类</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['科技', '财经', '娱乐', '体育', '健康', '教育'].map((category) => (
                  <button
                    key={category}
                    className="px-4 py-2 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 隐私与安全 */}
          <Card>
            <CardHeader>
              <CardTitle>隐私与安全</CardTitle>
              <CardDescription>管理你的隐私和安全设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">数据导出</p>
                <p className="text-sm text-muted-foreground">
                  下载你在平台上的所有数据
                </p>
                <button className="text-sm text-primary hover:underline">
                  申请数据导出
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">删除账户</p>
                <p className="text-sm text-muted-foreground">
                  永久删除你的账户和所有数据
                </p>
                <button className="text-sm text-destructive hover:underline">
                  删除我的账户
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
