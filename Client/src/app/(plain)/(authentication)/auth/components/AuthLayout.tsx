import type { ChildrenType } from '@/types/component'
import { Col, Container, Row } from 'react-bootstrap'

// Allow passing fluid to expand container full width if needed
type AuthLayoutProps = ChildrenType & { fluid?: boolean }

const AuthLayout = ({ children, fluid = false }: AuthLayoutProps) => {
  return (
    <main className="auth-background">
      <div className="auth-header-text">Connect. Invest. Grow</div>
      <Container fluid={fluid}>
        <Row className="justify-content-center align-items-center vh-100">
          <Col xs={12} sm={10} md={8} lg={7} xl={6} xxl={5}>
            {children}
          </Col>
        </Row>
      </Container>
    </main>
  )
}
export default AuthLayout
