import { currentYear, developedBy, developedByLink } from '@/context/constants'
import type { ProfilePanelLink } from '@/types/data'
import { Card, CardBody, CardFooter } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import { Link } from 'react-router-dom'
import Banner from '@/assets/images/bg/banner2.png'
import { formatDateToDDMMYYYY } from '@/utils/date'

type ProfilePanelProps = {
  links: ProfilePanelLink[]
}

const hebrewToEnglishInterestMap: { [key: string]: string } = {
  'שוק ההון': 'Stock Market',
  קריפטו: 'Crypto',
  'נדל״ן': 'Real Estate',
  'חיסכון וניהול תקציב': 'Savings and Budgeting',
  'פנסיה והשקעות סולידיות': 'Pension and Conservative Investments',
}

const ProfilePanel = ({ links }: ProfilePanelProps) => {
  const { user } = useAuthContext()

  return (
    <>
      <Card className="overflow-hidden h-100">
        <div
          className="h-50px"
          style={{
            backgroundImage: `url(${Banner})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <CardBody className="pt-0">
          <div className="text-center">
            <div className="avatar avatar-lg mt-n5 mb-3">
              <span role="button">
                <img
                  height={64}
                  width={64}
                  src={user ? user.profilePic || placeHolder : placeHolder}
                  alt="avatar"
                  className="avatar-img rounded border border-white border-3"
                />
              </span>
            </div>

            <h5 className="mb-0">
              <Link to={`/profile/feed/${user?.userId}`}>{user ? user.firstName + ' ' + user.lastName : 'Guest'}</Link>
            </h5>

            <p className="mt-3" style={{ overflowWrap: 'anywhere' }}>
              {user ? user.bio : 'No bio available'}
            </p>

            <div className="hstack gap-2 gap-xl-3 justify-content-center">
              <div>
                <h6 className="mb-0 small">
                  {user && user.interestCategory ? hebrewToEnglishInterestMap[user.interestCategory] || user.interestCategory : 'No Interest'}
                </h6>

                <small className="text-muted fs-xs">Interest</small>
              </div>
              <div className="vr" />
              <div>
                <h6 className="mb-0 small">{user ? user?.createdAt : 'No Date'}</h6>
                <small className="text-muted fs-xs">Joined</small>
              </div>
              <div className="vr" />
              <div>
                <h6 className="mb-0 small">{user ? (user.isActive ? 'Active' : 'Inactive') : 'N/A'}</h6>
                <small className="text-muted fs-xs">Status</small>
              </div>
            </div>
          </div>

          <hr />

          <ul className="nav nav-link-secondary flex-column fw-bold gap-2">
            {links.map((item, idx) => (
              <li key={item.name + idx} className="nav-item">
                <Link className="nav-link" to={item.link}>
                  <img src={item.image} alt="icon" height={20} width={20} className="me-2 h-20px fa-fw" />
                  <span>{item.name} </span>
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
        <CardFooter className="text-center py-2">
          <Link className="btn btn-sm btn-link" to={`/profile/feed/${user?.userId}`}>
            View Profile
          </Link>
        </CardFooter>
      </Card>

      <p className="small text-center mt-1">
        ©{currentYear}
        <a className="text-reset" target="_blank" rel="noreferrer" href={developedByLink}>
          {developedBy}
        </a>
      </p>
    </>
  )
}

export default ProfilePanel
