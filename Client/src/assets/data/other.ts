import type { ChatMessageType, UserType } from '@/types/data'
import { addOrSubtractDaysFromDate, addOrSubtractMinutesFromDate } from '@/utils/date'

import avatar1 from '@/assets/images/avatar/01.jpg'
import avatar2 from '@/assets/images/avatar/02.jpg'
import avatar3 from '@/assets/images/avatar/03.jpg'
import avatar4 from '@/assets/images/avatar/04.jpg'
import avatar5 from '@/assets/images/avatar/05.jpg'
import avatar6 from '@/assets/images/avatar/06.jpg'
import avatar8 from '@/assets/images/avatar/08.jpg'
import avatar9 from '@/assets/images/avatar/09.jpg'
import avatar10 from '@/assets/images/avatar/10.jpg'
import avatar11 from '@/assets/images/avatar/11.jpg'
import avatar12 from '@/assets/images/avatar/12.jpg'

import element14 from '@/assets/images/elements/14.svg'

export const users: UserType[] = [
  {
    id: '101',
    name: 'Frances Guerrero',
    avatar: avatar1,
    mutualCount: 50,
    role: 'News anchor',
    status: 'online',
    lastMessage: 'Frances sent a photo.',
    lastActivity: addOrSubtractMinutesFromDate(0),
  },
  {
    id: '102',
    name: 'Lori Ferguson',
    avatar: avatar2,
    mutualCount: 33,
    isStory: true,
    role: 'Web Developer',
    status: 'online',
    lastMessage: 'You missed a call form Carolyn🤙',
    lastActivity: addOrSubtractMinutesFromDate(1),
  },
  {
    id: '103',
    name: 'Samuel Bishop',
    avatar: avatar3,
    mutualCount: 21,
    hasRequested: true,
    role: 'News anchor',
    status: 'offline',
    lastMessage: 'Day sweetness why cordially 😊',
    lastActivity: addOrSubtractMinutesFromDate(2),
  },
  {
    id: '104',
    name: 'Dennis Barrett',
    avatar: avatar4,
    mutualCount: 45,
    role: 'Web Developer at Webestica',
    status: 'offline',
    lastMessage: 'Happy birthday🎂',
    lastActivity: addOrSubtractMinutesFromDate(10),
  },
  {
    id: '105',
    name: 'Judy Nguyen',
    avatar: avatar5,
    mutualCount: 35,
    role: 'News anchor',
    status: 'online',
    lastMessage: 'Thank you!',
    lastActivity: addOrSubtractMinutesFromDate(120),
  },
  {
    id: '106',
    name: 'Carolyn Ortiz',
    avatar: avatar6,
    mutualCount: 50,
    role: 'Web Developer',
    status: 'online',
    lastMessage: 'Greetings from Webestica.',
    lastActivity: addOrSubtractDaysFromDate(1),
  },
  {
    id: '107',
    name: 'Bryan Knight',
    avatar: avatar8,
    mutualCount: 33,
    role: 'News anchor',
    status: 'offline',
    lastMessage: 'Btw are you looking for job change?',
    lastActivity: addOrSubtractDaysFromDate(4),
  },
  {
    id: '108',
    name: 'Louis Crawford',
    avatar: avatar9,
    mutualCount: 33,
    role: 'Web Developer at Webestica',
    status: 'offline',
    lastMessage: 'if you are available to discuss🙄',
    lastActivity: addOrSubtractDaysFromDate(4),
  },
  {
    id: '109',
    name: 'Jacqueline Miller',
    avatar: avatar10,
    mutualCount: 33,
    role: 'Web Developer',
    status: 'online',
    lastMessage: '🙌Congrats on your work anniversary!',
    lastActivity: addOrSubtractDaysFromDate(6),
  },
  {
    id: '110',
    name: 'Amanda Reed',
    avatar: avatar11,
    mutualCount: 33,
    role: 'News anchor',
    status: 'online',
    lastMessage: 'No sorry, Thanks.',
    lastActivity: addOrSubtractDaysFromDate(10),
  },
  {
    id: '111',
    name: 'Larry Lawson',
    avatar: avatar12,
    mutualCount: 33,
    role: 'Web Developer',
    status: 'offline',
    lastMessage: 'Interested can share CV at.',
    lastActivity: addOrSubtractDaysFromDate(18),
  },
]

export const messages: ChatMessageType[] = []

const defaultTo: UserType = {
  id: '108',
  lastActivity: addOrSubtractMinutesFromDate(0),
  lastMessage: 'Hey! Okay, thank you for letting me know. See you!',
  status: 'online',
  avatar: avatar10,
  mutualCount: 30,
  name: 'Judy Nguyen',
  role: 'web',
}

for (const user of users) {
  messages.push(
    {
      id: '451',
      to: defaultTo,
      from: user,
      message: 'Applauded no discovery in newspaper allowance am northward😊',
      sentOn: addOrSubtractMinutesFromDate(110),
    },
    {
      id: '452',
      to: user,
      from: defaultTo,
      message: 'With pleasure',
      sentOn: addOrSubtractMinutesFromDate(100),
      isRead: true,
    },
    {
      id: '454',
      to: user,
      from: defaultTo,
      message: 'No visited raising gravity outward subject my cottage Mr be.',
      sentOn: addOrSubtractMinutesFromDate(100),
      isRead: true,
    },
    {
      id: '455',
      to: defaultTo,
      from: user,
      message: 'Please find the attached updated files',
      sentOn: addOrSubtractMinutesFromDate(90),
    },
    {
      id: '456',
      to: defaultTo,
      from: user,
      message: 'How promotion excellent curiosity yet attempted happiness Gay prosperous impression😮',
      sentOn: addOrSubtractMinutesFromDate(80),
    },
    {
      id: '457',
      to: defaultTo,
      from: user,
      message: 'Congratulations:)',
      sentOn: addOrSubtractMinutesFromDate(80),
      image: element14,
    },
    {
      id: '458',
      to: user,
      from: defaultTo,
      message: 'And sir dare view but over man So at within mr to simple assure Mr disposing.',
      sentOn: addOrSubtractMinutesFromDate(80),
      isSend: true,
    },
    // {
    //   id: '458',
    //   to: user,
    //   from: defaultTo,
    //   message: 'And sir dare view but over man So at within mr to simple assure Mr disposing.',
    //   sentOn: addOrSubtractMinutesFromDate(80),
    // },
    {
      id: '459',
      to: defaultTo,
      from: user,
      message: 'Traveling alteration impression 🤐 six all uncommonly Chamber hearing inhabit joy highest private.',
      sentOn: addOrSubtractMinutesFromDate(80),
    },
  )
}
