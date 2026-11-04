import { redirect } from 'next/navigation'

/** Games UI removed — single portfolio CMS keeps Terminal as a feature toggle only. */
export default function GamesRemovedRedirect() {
  redirect('/admin/features')
}
