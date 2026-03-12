import { NextResponse } from "next/server";
import { Resend } from "resend";
import { NotificationEmail } from "@/components/emails/NotificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { to, subject, title, message, actionText, actionUrl } = await req.json();

        if (!to || !subject || !title || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            console.warn("RESEND_API_KEY is not set. Simulation mode.");
            return NextResponse.json({ success: true, simulated: true });
        }

        const data = await resend.emails.send({
            from: "Daniel from Follio <notifications@follio.app>",
            to: [to],
            subject: subject,
            react: NotificationEmail({
                title,
                message,
                actionText,
                actionUrl,
            }),
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error sending notification email:", error);
        return NextResponse.json(
            { error: "Failed to send notification email", details: error },
            { status: 500 }
        );
    }
}
