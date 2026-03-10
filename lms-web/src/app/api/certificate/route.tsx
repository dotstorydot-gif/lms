/** @jsxImportSource react */
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const certId = searchParams.get('id')

    if (!certId) return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 })

    try {
        const supabase = await createClient()

        const { data: cert } = await supabase
            .from('certificates')
            .select(`
                id, unique_code, issued_at,
                user_profiles (full_name),
                courses (title,
                    tenants (name, primary_color)
                )
            `)
            .eq('id', certId)
            .single()

        if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })

        const { renderToBuffer, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')

        const course = cert.courses as any
        const tenant = course?.tenants as any
        const studentName = (cert.user_profiles as any)?.full_name || 'Student'
        const primaryColor = tenant?.primary_color || '#7C3AED'

        const styles = StyleSheet.create({
            page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 60, fontFamily: 'Helvetica' },
            border: { border: '4px solid ' + primaryColor, borderRadius: 8, padding: 48, flex: 1, alignItems: 'center', justifyContent: 'center' },
            academyName: { fontSize: 13, color: '#64748B', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 },
            heading: { fontSize: 11, color: '#94A3B8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
            recipientName: { fontSize: 38, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 20 },
            certText: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 8 },
            courseName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: primaryColor, textAlign: 'center', marginBottom: 32 },
            divider: { width: 120, height: 3, backgroundColor: primaryColor, marginVertical: 24 },
            footer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 40 },
            footerLabel: { fontSize: 10, color: '#94A3B8' },
            footerValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#475569', marginTop: 2 },
            uniqueCode: { fontSize: 9, color: '#CBD5E1', fontFamily: 'Helvetica-Oblique', marginTop: 2 },
        })

        const dateStr = new Date(cert.issued_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        })

        const pdfDoc = (
            <Document title={`Certificate - ${course?.title}`} author={tenant?.name || 'LearnHub'}>
                <Page size="A4" orientation="landscape" style={styles.page}>
                    <View style={styles.border}>
                        <Text style={styles.academyName}>{tenant?.name || 'LearnHub Academy'}</Text>
                        <Text style={styles.heading}>Certificate of Completion</Text>
                        <View style={styles.divider} />
                        <Text style={styles.heading}>This certifies that</Text>
                        <Text style={styles.recipientName}>{studentName}</Text>
                        <Text style={styles.certText}>has successfully completed the course</Text>
                        <Text style={styles.courseName}>{course?.title}</Text>
                        <View style={styles.divider} />
                        <View style={styles.footer}>
                            <View>
                                <Text style={styles.footerLabel}>Issued on</Text>
                                <Text style={styles.footerValue}>{dateStr}</Text>
                            </View>
                            <View>
                                <Text style={styles.footerLabel}>Certificate ID</Text>
                                <Text style={styles.uniqueCode}>{cert.unique_code.slice(0, 24).toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </Page>
            </Document>
        )

        const pdfBuffer = await renderToBuffer(pdfDoc)
        const uint8Array = new Uint8Array(pdfBuffer)

        return new NextResponse(uint8Array, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="certificate-${cert.unique_code.slice(0, 8)}.pdf"`,
            },
        })

    } catch (err: any) {
        console.error('Certificate PDF error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
