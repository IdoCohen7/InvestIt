import type { ChildrenType } from '@/types/component'
import { Col, Container, Row } from 'react-bootstrap'

const AuthLayout = ({ children }: ChildrenType) => {
  return (
    <main style={{
      backgroundImage: 'url("/images/back.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh'
    }}>
      <Container>
        <Row className="justify-content-center align-items-center vh-100 py-5">
          <Col sm={10} md={8} lg={7} xl={6} xxl={5}>
            {children}
          </Col>
        </Row>
      </Container>
    </main>
  )
}
export default AuthLayout
