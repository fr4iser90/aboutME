'use client'

import { useRouter } from 'next/navigation'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'
import DashboardCard from '@/features/admin/components/Dashboard/DashboardCard'
import StatsCard from '@/features/admin/components/Dashboard/StatsCard'
import FeatureToggleCard from '@/features/admin/components/Dashboard/FeatureToggleCard'
import SetupBanner from '@/features/admin/components/Dashboard/SetupBanner'

export default function DashboardPage() {
  const router = useRouter()

  const quickActions = [
    {
      label: 'Edit Content',
      icon: 'Co',
      href: '/admin/content',
      color: 'blue' as const,
    },
    {
      label: 'Media Library',
      icon: 'Me',
      href: '/admin/media',
      color: 'pink' as const,
    },
    {
      label: 'Manage Features',
      icon: 'Fe',
      href: '/admin/features',
      color: 'purple' as const,
    },
    {
      label: 'Review Queue',
      icon: 'Re',
      href: '/admin/review',
      color: 'green' as const,
    },
    {
      label: 'View Portfolio',
      icon: 'Go',
      href: '/',
      external: true,
      color: 'cyan' as const,
    },
    {
      label: 'Appearance',
      icon: 'Ap',
      href: '/admin/appearance',
      color: 'blue' as const,
    },
  ]

  const recentActivity = [
    { text: 'Content editor accessed', time: '2h ago' },
    { text: 'Feature configuration updated', time: '5h ago' },
    { text: 'New project added', time: '1d ago' },
  ]

  const handleQuickAction = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank')
    } else {
      router.push(href)
    }
  }

  return (
    <AdminPageLayout
      title="Welcome back"
      subtitle="Manage your portfolio from this control panel"
      centered={false}
      maxWidth="full"
    >
      <SetupBanner />

      <div className="dashboard__stats-grid">
        <StatsCard
          label="Projects"
          icon="Pr"
          dataPath="/data/projects/projects.json"
          color="blue"
        />
        <StatsCard
          label="Skills"
          icon="Sk"
          dataPath="/data/skills/skills.json"
          countKey="skills"
          color="purple"
        />
        <StatsCard
          label="Blog Posts"
          icon="Bl"
          dataPath="/data/blog/blog.json"
          countKey="posts"
          color="green"
        />
      </div>

      <div className="dashboard__features">
        <FeatureToggleCard />
      </div>

      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="dashboard__quick-actions">
          {quickActions.map((action) => (
            <DashboardCard
              key={action.href}
              title={action.label}
              icon={action.icon}
              value="→"
              onClick={() => handleQuickAction(action.href, action.external)}
              color={action.color}
            />
          ))}
        </div>
      </div>

      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Recent Activity</h2>
        <div className="glass-card dashboard__activity">
          <div className="dashboard__activity-list">
            {recentActivity.map((item, index) => (
              <div key={index} className="dashboard__activity-item">
                <span className="dashboard__activity-text">{item.text}</span>
                <span className="dashboard__activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageLayout>
  )
}
