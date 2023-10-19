import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {Layout, Menu, Result, theme, Typography} from 'antd';
import Home from '../pages/Home';
import Book from '../pages/Book';
import './css/layout.css';
import Token from "../pages/Token";

const {Header, Content, Footer} = Layout;
const {Title} = Typography;

const AppLayout = () => {
    const {
        token: {colorBgContainer},
    } = theme.useToken();
    return (
        <Layout className="layout full-height-layout">
            <Header style={{display: 'flex', alignItems: 'center'}}>
                <Title level={2} underline type='warning'>Ello</Title>
                <Menu theme="dark" mode="horizontal"
                      items={[
                          {
                              label: 'Home',
                              key: 'home',
                              path: '/',
                          },
                          {
                              label: 'Book',
                              key: 'book',
                              path: '/book',
                          },
                      ]}
                />
            </Header>
            <Content>
                <div
                    className="site-layout-content"
                    style={{
                        background: colorBgContainer,
                        flex: '1 0 auto',
                        overflowY: 'auto',
                        display: 'flex',
                    }}
                >
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/book/*" element={<Book/>}/>
                            <Route path="/token" element={<Token/>}/>
                            <Route path="*" element={
                                <div style={{justifyContent: "center", alignContent: "center", flex: '1 1 auto'}}>
                                    <Result
                                        status="404"
                                        title="404"
                                        subTitle="Sorry, the page you are looking for is missing"/>
                                </div>
                            }/>
                        </Routes>
                    </Router>
                </div>
            </Content>
            <Footer
                style={{
                    textAlign: 'center',
                }}
            >
                Ant Design ©2023 Created by Ant UED
            </Footer>
        </Layout>
    );
}

export default AppLayout;
