import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Link,
} from "@react-email/components";
import * as React from "react";

interface NotificationEmailProps {
    title: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
    type?: "alert" | "info" | "success" | "warning";
}

export const NotificationEmail = ({
    title = "New Portfolio Alert",
    message = "You have a new update in your Follio workspace.",
    actionText = "View in Dashboard",
    actionUrl = "https://follio.app/dashboard",
}: NotificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>{title}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={titleStyle}>{title}</Heading>
                    <Text style={messageStyle}>{message}</Text>

                    {actionText && actionUrl && (
                        <Text style={messageStyle}>
                            <Link style={linkStyle} href={actionUrl}>
                                {actionText} →
                            </Link>
                        </Text>
                    )}

                    <Text style={signoff}>
                        Best,<br />
                        Daniel from Follio
                    </Text>

                    <Hr style={hr} />
                    <Text style={footerText}>
                        © 2026 Follio. You are receiving this because you have alerts enabled in your workspace.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default NotificationEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "560px",
};

const titleStyle = {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: "600" as const,
    color: "#1a1a1a",
    margin: "0 0 16px 0",
};

const messageStyle = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#444444",
    margin: "0 0 16px 0",
};

const linkStyle = {
    color: "#2563eb",
    textDecoration: "underline",
    fontWeight: "500" as const,
};

const signoff = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#444444",
    margin: "24px 0 0 0",
};

const hr = {
    borderColor: "#e5e5e5",
    margin: "32px 0 16px 0",
};

const footerText = {
    fontSize: "12px",
    lineHeight: "18px",
    color: "#999999",
    margin: "0",
};
