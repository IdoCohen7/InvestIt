import type { ProfilePanelLink } from '@/types/data'

import homeImg from '@/assets/images/icon/home-outline-filled.svg'
import personImg from '@/assets/images/icon/person-outline-filled.svg'
import earthImg from '@/assets/images/icon/earth-outline-filled.svg'
import chatImg from '@/assets/images/icon/chat-outline-filled.svg'
import notificationImg from '@/assets/images/icon/notification-outlined-filled.svg'
import cogImg from '@/assets/images/icon/cog-outline-filled.svg'
import shieldImg from '@/assets/images/icon/shield-outline-filled.svg'
import handshakeImg from '@/assets/images/icon/handshake-outline-filled.svg'
import chatAltImg from '@/assets/images/icon/chat-alt-outline-filled.svg'
import trashImg from '@/assets/images/icon/trash-var-outline-filled.svg'
import coinImg from '@/assets/images/icon/coins-outline-filled.svg'

export const profilePanelLinksData1: ProfilePanelLink[] = [
  {
    image: homeImg,
    name: 'Feed',
    link: '/profile/feed',
  },
  {
    image: earthImg,
    name: 'Latest News',
    link: '/news',
  },
  {
    image: chatImg,
    name: 'Groups',
    link: '/groups',
  },
  {
    image: coinImg,
    name: 'Live Stock Prices',
    link: '/stocks',
  },
  {
    image: notificationImg,
    name: 'Notifications',
    link: '/notifications',
  },
  {
    image: cogImg,
    name: 'Settings',
    link: '/settings/account',
  },
]

export const settingPanelLinksData: ProfilePanelLink[] = [
  {
    image: personImg,
    name: 'Account',
    link: '/settings/account',
  },
  {
    image: notificationImg,
    name: 'Notification',
    link: '/settings/notification',
  },
  {
    image: shieldImg,
    name: 'Privacy and safety',
    link: '/settings/privacy',
  },
  {
    image: handshakeImg,
    name: 'Communications',
    link: '/settings/communication',
  },
  {
    image: chatAltImg,
    name: 'Messaging',
    link: '/settings/messaging',
  },
  {
    image: trashImg,
    name: 'Close account',
    link: '/settings/close-account',
  },
]
