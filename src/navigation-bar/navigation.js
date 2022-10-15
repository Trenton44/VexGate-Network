import React from 'react';
import { Nav, Navbar, Container, Row } from 'react-bootstrap';
class Navigation extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
            <Nav bg="dark" expand="lg">
                <Container fluid>
                    <Row>
                        <Navbar.Brand> The Vex Gate Network </Navbar.Brand>
                        <Nav.Link href="/">Characters</Nav.Link>
                    </Row>
                </Container>
            </Nav>
        );
    }
}
export default Navigation;