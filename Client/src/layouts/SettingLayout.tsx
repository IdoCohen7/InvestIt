import { lazy, Suspense } from 'react'
const TopHeader = lazy(() => import('@/components/layout/TopHeader'))
import type { ChildrenType } from '@/types/component'
import { Col, Container, Row } from 'react-bootstrap'
import FallbackLoading from '@/components/FallbackLoading'
import Preloader from '@/components/Preloader'

const SettingLayout = ({ children }: ChildrenType) => {
  return (
    <>
      <Suspense fallback={<FallbackLoading />}>
        <TopHeader />
      </Suspense>
      <main>
        <Container>
          <Row>
            <Col lg={6} className="vstack gap-4">
              <div className="tab-content py-0 mb-0">
                <Suspense fallback={<Preloader />}>{children}</Suspense>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}
export default SettingLayout
