import { useState } from 'react';
import { useSEO, VisualTheme, AppView } from '../context/SEOContext';
import { jsPDF } from 'jspdf';
import { SEOAuditReport } from '../../shared/types';
import { 
  Sun, 
  Moon, 
  Palette, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  User, 
  LogOut, 
  RefreshCw, 
  AlertOctagon, 
  Layout, 
  Loader2,
  Sparkles
} from 'lucide-react';

/* ==========================================
   1. Theme Switcher Component
   ========================================== */
export function ThemeSwitcher() {
  const { theme, setTheme } = useSEO();

  const themes: { id: VisualTheme; icon: any; label: string; bg: string }[] = [
    { id: 'light', icon: Sun, label: 'Light', bg: 'hover:text-amber-500' },
    { id: 'dark', icon: Moon, label: 'Dark Void', bg: 'hover:text-indigo-400' },
    { id: 'midnight', icon: Palette, label: 'Midnight Slate', bg: 'hover:text-emerald-400' }
  ];

  return (
    <div className="flex items-center space-x-1.5 bg-gray-900 border border-gray-800 p-1 rounded-xl">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${t.bg} ${
              isActive
                ? 'bg-gray-950 text-emerald-400 border border-gray-800/80 shadow'
                : 'text-gray-500 hover:bg-gray-950/40'
            }`}
            title={t.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline text-[10px] font-mono font-bold uppercase tracking-wider">{t.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================
   2. Export Buttons Component
   ========================================== */
export function ExportButtons({ report }: { report: SEOAuditReport }) {
  const { addToast } = useSEO();
  const [downloading, setDownloading] = useState<'csv' | 'pdf' | null>(null);

  const exportCSV = () => {
    setDownloading('csv');
    addToast('Parsing meta tags & structural layout into spreadsheet metrics...', 'info');

    setTimeout(() => {
      try {
        // Create CSV lines
        const dataRows = [
          ['SEO AI PRO CONSOLE - WEBCRAWL AUDIT REPORT'],
          ['Target Domain/URL', report.url],
          ['Crawl Timestamp', new Date(report.timestamp).toISOString()],
          ['Report Generated At', new Date().toISOString()],
          [],
          ['OVERALL SEO METRICS SUMMARY'],
          ['Performance Area', 'Score', 'Evaluation Status'],
          ['Overall Score', report.overallScore, report.overallScore >= 80 ? 'Good' : report.overallScore >= 50 ? 'Warning' : 'Critical'],
          ['On-Page Content Score', report.scores.onPage, report.scores.onPage >= 80 ? 'Good' : report.scores.onPage >= 50 ? 'Warning' : 'Critical'],
          ['Technical Compliance Score', report.scores.technical, report.scores.technical >= 80 ? 'Good' : report.scores.technical >= 50 ? 'Warning' : 'Critical'],
          ['Page Performance/Latency Score', report.scores.performance, report.scores.performance >= 80 ? 'Good' : report.scores.performance >= 50 ? 'Warning' : 'Critical'],
          [],
          ['DETAILED FACTOR CHECKLIST INDEX'],
          ['Audit Element', 'Category', 'Compliance Status', 'Scored Value / Count', 'Diagnostic Warning Message', 'Actionable Recommendation'],
          
          ['Meta Title Tag', 'On-Page', report.metrics.title.status, report.metrics.title.value || '(Missing)', report.metrics.title.message, report.metrics.title.recommendation || 'Keep titles between 50-60 characters.'],
          ['Meta Description Tag', 'On-Page', report.metrics.description.status, report.metrics.description.value || '(Missing)', report.metrics.description.message, report.metrics.description.recommendation || 'Keep descriptions between 120-160 characters.'],
          ['H1 Header Structure', 'On-Page', report.metrics.headings.status, `${report.metrics.headings.h1Count} H1 found`, report.metrics.headings.message, report.metrics.headings.recommendation || 'Ensure exactly one H1 exists per crawled page.'],
          ['Image Alt Tags Attribute', 'On-Page', report.metrics.images.status, `${report.metrics.images.missingAlt} of ${report.metrics.images.total} missing`, report.metrics.images.message, report.metrics.images.recommendation || 'Add descriptional alt text tags to all active images.'],
          ['Outbound Links Status', 'On-Page', report.metrics.links.status, `${report.metrics.links.internal} internal / ${report.metrics.links.external} external`, report.metrics.links.message, report.metrics.links.recommendation || 'Audit links periodically to find dead routes.'],
          ['HTTPS SSL Certificate Secure', 'Technical', report.metrics.technical.status, report.metrics.technical.isHttps ? 'HTTPS Secure active' : 'HTTP unsecure', report.metrics.technical.message, report.metrics.technical.recommendation || 'Redirect all traffic to secure port 443 HTTPS.'],
          ['Sitemap XML Discoverability', 'Technical', report.metrics.technical.status, report.metrics.technical.hasSitemap ? 'Sitemap present' : 'Sitemap absent', report.metrics.technical.message, report.metrics.technical.recommendation || 'Generate and publish a standard sitemap.xml file.'],
          ['Robots Indexing Directive', 'Technical', report.metrics.technical.status, report.metrics.technical.hasRobots ? 'Robots.txt present' : 'Robots.txt absent', report.metrics.technical.message, report.metrics.technical.recommendation || 'Publish a robots.txt containing crawl pathways.'],
          ['Server Page Load Latency', 'Performance', report.metrics.performance.status, `${report.metrics.performance.loadTimeMs} ms`, report.metrics.performance.message, report.metrics.performance.recommendation || 'Optimize static assets, implement CDN caches.'],
          ['Crawl Transfer Bundle Size', 'Performance', report.metrics.performance.status, `${report.metrics.performance.pageSizeKb} KB`, report.metrics.performance.message, report.metrics.performance.recommendation || 'Compress styles, scripts, and high resolution images.']
        ];

        // Append crawled headings
        if (report.metrics.headings.list && report.metrics.headings.list.length > 0) {
          dataRows.push([]);
          dataRows.push(['CRAWLED SITE HEADING TAGS TREE']);
          dataRows.push(['Heading Type', 'Heading Content Text']);
          report.metrics.headings.list.forEach(h => {
            dataRows.push([h.type.toUpperCase(), h.text]);
          });
        }

        // Append AI suggestions
        if (report.aiRecommendations) {
          dataRows.push([]);
          dataRows.push(['GEMINI AI STRATEGIC RECOMMENDATIONS']);
          const recLines = report.aiRecommendations.split('\n');
          recLines.forEach(line => {
            if (line.trim()) {
              dataRows.push([line.replace(/\*/g, '').trim()]);
            }
          });
        }

        // Generate CSV file content
        const csvContent = "\uFEFF" + dataRows.map(row => 
          row.map(val => {
            const strVal = String(val === null || val === undefined ? '' : val);
            return `"${strVal.replace(/"/g, '""')}"`;
          }).join(",")
        ).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const cleanUrl = report.url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
        link.setAttribute("href", url);
        link.setAttribute("download", `SEO_Audit_Report_${cleanUrl}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloading(null);
        addToast('SEO audit spreadsheet downloaded successfully!', 'success');
      } catch (err: any) {
        console.error('CSV Export Failed', err);
        setDownloading(null);
        addToast(`CSV compilation failed: ${err.message || err}`, 'error');
      }
    }, 1000);
  };

  const exportPDF = () => {
    setDownloading('pdf');
    addToast('Composing printable optimization blueprint details...', 'info');

    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const margin = 15;
        const pageWidth = 210;
        const pageHeight = 297;
        const contentWidth = pageWidth - (margin * 2); // 180mm
        let currentY = 15;

        // Colors
        const primaryColor = [15, 23, 42]; // deep slate (#0f172a)
        const accentColor = [16, 185, 129]; // emerald (#10b981)
        const textColorDark = [33, 37, 41];
        const textColorLight = [100, 116, 139];
        const bgGrayLight = [248, 250, 252];
        const borderGray = [226, 232, 240];

        // Header Helper
        const drawHeader = (pageNum: number) => {
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(margin, 15, contentWidth, 30, 'F');

          // White Text
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text('SEO AUDIT & PERFORMANCE REPORT', margin + 8, 26);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(165, 180, 252);
          doc.text('AUTOMATED WEBCRAWL INDEX & AI OPTIMIZATION BLUEPRINT', margin + 8, 33);

          // Right aligned logo/credit
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(16, 185, 129);
          doc.text('SEO AI PRO', pageWidth - margin - 8, 26, { align: 'right' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(200, 200, 200);
          doc.text(`Page ${pageNum}`, pageWidth - margin - 8, 33, { align: 'right' });

          currentY = 52;
        };

        const drawFooter = (pNum: number) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
          doc.setLineWidth(0.3);
          doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
          doc.text(`Confidential Client Presentation | Generated by SEO AI Pro Console`, margin, pageHeight - 10);
          doc.text(`Page ${pNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };

        // Helper to handle auto page break
        let pageNum = 1;
        const ensureSpace = (neededHeight: number) => {
          if (currentY + neededHeight > pageHeight - 20) {
            drawFooter(pageNum);
            doc.addPage();
            pageNum++;
            drawHeader(pageNum);
          }
        };

        // Start Page 1
        drawHeader(pageNum);

        // Target Details Box
        ensureSpace(25);
        doc.setFillColor(bgGrayLight[0], bgGrayLight[1], bgGrayLight[2]);
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, currentY, contentWidth, 22, 'FD');

        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('AUDIT TARGET PROFILE', margin + 6, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(textColorLight[0], textColorLight[1], textColorLight[2]);
        doc.text(`Target URL:`, margin + 6, currentY + 12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(report.url, margin + 28, currentY + 12);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColorLight[0], textColorLight[1], textColorLight[2]);
        doc.text(`Timestamp:`, margin + 6, currentY + 17);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
        doc.text(new Date(report.timestamp).toLocaleString(), margin + 28, currentY + 17);

        currentY += 28;

        // Scoring Overview Grid
        ensureSpace(40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('EXECUTIVE PERFORMANCE SCORES', margin, currentY);
        currentY += 5;

        // Draw 4 boxes for Overall, OnPage, Technical, Performance
        const boxWidth = (contentWidth - 9) / 4; // approx 42mm each
        const scoreCategories = [
          { label: 'Overall Score', score: report.overallScore, color: [16, 185, 129] },
          { label: 'On-Page SEO', score: report.scores.onPage, color: [59, 130, 246] },
          { label: 'Technical SEO', score: report.scores.technical, color: [99, 102, 241] },
          { label: 'Performance', score: report.scores.performance, color: [236, 72, 153] }
        ];

        scoreCategories.forEach((cat, index) => {
          const x = margin + index * (boxWidth + 3);
          doc.setFillColor(bgGrayLight[0], bgGrayLight[1], bgGrayLight[2]);
          doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
          doc.rect(x, currentY, boxWidth, 24, 'FD');

          // Top colored indicator line
          doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
          doc.rect(x, currentY, boxWidth, 1.5, 'F');

          // Score text
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(20);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(`${cat.score}`, x + boxWidth / 2, currentY + 11, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(textColorLight[0], textColorLight[1], textColorLight[2]);
          doc.text(cat.label.toUpperCase(), x + boxWidth / 2, currentY + 16, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          const scoreStatus = cat.score >= 80 ? 'EXCELLENT' : cat.score >= 50 ? 'WARNING' : 'CRITICAL';
          doc.setTextColor(cat.color[0], cat.color[1], cat.color[2]);
          doc.text(scoreStatus, x + boxWidth / 2, currentY + 20, { align: 'center' });
        });

        currentY += 32;

        // Metric Details Section
        ensureSpace(80);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('DETAILED AUDIT MATRIX', margin, currentY);
        currentY += 5;

        // Table headers
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(margin, currentY, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('SEO FACTOR / AUDIT ELEMENT', margin + 4, currentY + 5.5);
        doc.text('STATUS', margin + 75, currentY + 5.5);
        doc.text('RESULT VALUE / MESSAGE', margin + 98, currentY + 5.5);

        currentY += 8;

        // Prepare table row data
        const rows = [
          { name: 'Meta Title Tag', status: report.metrics.title.status, val: report.metrics.title.value || '(Missing)', msg: report.metrics.title.message },
          { name: 'Meta Description Tag', status: report.metrics.description.status, val: report.metrics.description.value || '(Missing)', msg: report.metrics.description.message },
          { name: 'H1 Header Structure', status: report.metrics.headings.status, val: `${report.metrics.headings.h1Count} H1 found`, msg: report.metrics.headings.message },
          { name: 'Image Alt Tags Status', status: report.metrics.images.status, val: `${report.metrics.images.missingAlt} of ${report.metrics.images.total} missing alt`, msg: report.metrics.images.message },
          { name: 'Outbound Links Health', status: report.metrics.links.status, val: `${report.metrics.links.total} total links scanned`, msg: report.metrics.links.message },
          { name: 'HTTPS Encryption Secure', status: report.metrics.technical.status, val: report.metrics.technical.isHttps ? 'HTTPS Secure Active' : 'HTTP Non-Secure', msg: report.metrics.technical.message },
          { name: 'Sitemap XML Map Catalog', status: report.metrics.technical.status, val: report.metrics.technical.hasSitemap ? 'Sitemap Discovered' : 'Sitemap Missing', msg: report.metrics.technical.message },
          { name: 'Robots Indexing Directive', status: report.metrics.technical.status, val: report.metrics.technical.hasRobots ? 'Robots.txt Discovered' : 'Robots.txt Missing', msg: report.metrics.technical.message },
          { name: 'Server Page Load Latency', status: report.metrics.performance.status, val: `${report.metrics.performance.loadTimeMs} ms`, msg: report.metrics.performance.message },
          { name: 'Crawl Transfer Bundle Size', status: report.metrics.performance.status, val: `${report.metrics.performance.pageSizeKb} KB`, msg: report.metrics.performance.message }
        ];

        rows.forEach((row, rIdx) => {
          ensureSpace(12);
          // Alternate row backgrounds
          if (rIdx % 2 === 1) {
            doc.setFillColor(bgGrayLight[0], bgGrayLight[1], bgGrayLight[2]);
            doc.rect(margin, currentY, contentWidth, 10, 'F');
          }
          doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
          doc.line(margin, currentY + 10, margin + contentWidth, currentY + 10);

          // Name
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(row.name, margin + 4, currentY + 6.5);

          // Status Badge Background
          let badgeColor = [16, 185, 129]; // green
          if (row.status === 'warning') badgeColor = [245, 158, 11]; // amber
          if (row.status === 'error') badgeColor = [239, 68, 68]; // red

          doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
          doc.rect(margin + 75, currentY + 3.5, 16, 4.5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(255, 255, 255);
          doc.text(row.status.toUpperCase(), margin + 83, currentY + 6.8, { align: 'center' });

          // Message & Details (Word Wrapped)
          doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);

          const fullMsgText = `${row.val} - ${row.msg}`;
          const wrappedMsg = doc.splitTextToSize(fullMsgText, 78);
          doc.text(wrappedMsg, margin + 98, currentY + 5.5);

          currentY += 10;
        });

        currentY += 8;

        // Structured Headings Hierarchy List
        if (report.metrics.headings.list && report.metrics.headings.list.length > 0) {
          ensureSpace(40);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text('CRAWLED HEADING STRUCTURE TREE', margin, currentY);
          currentY += 5;

          const headingsToPrint = report.metrics.headings.list.slice(0, 15);
          headingsToPrint.forEach((h) => {
            ensureSpace(7);
            doc.setFillColor(bgGrayLight[0], bgGrayLight[1], bgGrayLight[2]);
            doc.rect(margin, currentY, contentWidth, 6, 'F');

            // H1 or H2 tag badge
            const isH1 = h.type.toLowerCase() === 'h1';
            doc.setFillColor(isH1 ? 16 : 59, isH1 ? 185 : 130, isH1 ? 129 : 246);
            doc.rect(margin + 2, currentY + 1.2, 8, 3.6, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.text(h.type.toUpperCase(), margin + 6, currentY + 3.8, { align: 'center' });

            // Heading Text
            doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.text(h.text.length > 95 ? h.text.substring(0, 95) + '...' : h.text, margin + 14, currentY + 4.2);

            currentY += 6.5;
          });
          currentY += 5;
        }

        // AI-Powered Recommendations Page / Box
        if (report.aiRecommendations) {
          ensureSpace(50);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text('GEMINI AI OPTIMIZATION RECOMMENDATIONS', margin, currentY);
          currentY += 5;

          // Background card for AI recs
          const startYForAiBox = currentY;
          doc.setFillColor(244, 247, 246); // extremely soft green/slate shade
          doc.setDrawColor(16, 185, 129); // emerald left accent border
          doc.rect(margin, currentY, contentWidth, 8, 'F'); // Temp starter box

          doc.setTextColor(16, 185, 129);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text('ACTIONABLE STEP-BY-STEP OPTIMIZATION PROTOCOL', margin + 5, currentY + 5.5);
          currentY += 10;

          // Split recommendations into clean lines
          const cleanRecs = report.aiRecommendations
            .replace(/##/g, '')
            .replace(/#/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '•');

          const wrappedRecsLines = doc.splitTextToSize(cleanRecs, contentWidth - 10);
          
          wrappedRecsLines.forEach((line: string) => {
            ensureSpace(6);
            // Draw background card continuation if needed
            doc.setFillColor(244, 247, 246);
            doc.rect(margin, currentY - 1, contentWidth, 6, 'F');
            
            doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(line, margin + 5, currentY + 3);
            currentY += 5;
          });

          // Draw an elegant left-side vertical accent border from start to finish
          doc.setDrawColor(16, 185, 129);
          doc.setLineWidth(1.5);
          doc.line(margin + 0.75, startYForAiBox, margin + 0.75, currentY);
        }

        // End of Document footer on final page
        drawFooter(pageNum);

        // Save PDF file
        const cleanUrl = report.url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`SEO_Audit_Report_${cleanUrl}.pdf`);

        setDownloading(null);
        addToast('SEO presentation PDF downloaded successfully!', 'success');
      } catch (err: any) {
        console.error('PDF Generation Failed', err);
        setDownloading(null);
        addToast(`PDF compilation failed: ${err.message || err}`, 'error');
      }
    }, 1200);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={exportCSV}
        disabled={!!downloading}
        className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
      >
        {downloading === 'csv' ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
        )}
        <span className="hidden sm:inline">EXPORT CSV</span>
      </button>

      <button
        onClick={exportPDF}
        disabled={!!downloading}
        className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
      >
        {downloading === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        ) : (
          <FileText className="h-4 w-4 text-blue-400" />
        )}
        <span className="hidden sm:inline">EXPORT PDF</span>
      </button>
    </div>
  );
}

/* ==========================================
   3. Progressive Gauge / Progress Bar
   ========================================== */
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const getColors = (v: number) => {
    if (v >= 80) return 'bg-emerald-500';
    if (v >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-1 w-full">
      {label && (
        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">
          <span>{label}</span>
          <span className="text-white">{value}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-gray-900 border border-gray-800/60 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${getColors(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ==========================================
   4. Loading Stream / Animation Component
   ========================================== */
export function LoadingAnimation({ url }: { url: string }) {
  const [streamIdx, setStreamIdx] = useState(0);

  const streams = [
    `Connecting via TLS handshake to target node: ${url}`,
    'Negotiating SEO-Audit-AI-Pro-Engine user agent configurations',
    'HTML body successfully fetched (status 200). Length calculated',
    'Executing element scavengers over meta structures...',
    'Analyzing Title, Description and Canonical links',
    'Walking Document Object Model to build heading tree hierarchy',
    'Evaluating accessibility metadata tags across images',
    'Firing out live HEAD requests to test outbound broken links',
    'Reading root files for Robots.txt rules and Sitemap channels',
    'Feeding diagnostic report structures to Gemini Pro LLM engine...',
    'Synthesizing ultimate tactical recommendations blueprint'
  ];

  // Increment console text sequentially for realism
  useState(() => {
    const timer = setInterval(() => {
      setStreamIdx(prev => {
        if (prev < streams.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1200);
    return () => clearInterval(timer);
  });

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 md:p-10 text-center space-y-6 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 animate-pulse" />
      
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
        <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Running SEO Index Scrapers</h3>
        <p className="text-xs text-gray-500">Scanning metadata, broken anchors, and compiling optimization scores.</p>
      </div>

      {/* Retro Crawler Console log output */}
      <div className="bg-black/80 border border-gray-900 rounded-xl p-4 text-left font-mono text-[10px] text-emerald-400 space-y-1.5 h-36 overflow-y-auto leading-relaxed shadow-inner">
        <div className="text-gray-600 border-b border-gray-900 pb-1.5 flex justify-between uppercase">
          <span>PRO-ENGINE CONSOLE v2.0</span>
          <span className="animate-pulse">● CRAWLING</span>
        </div>
        {streams.slice(0, streamIdx + 1).map((log, idx) => (
          <div key={idx} className="flex items-start space-x-2 animate-fade-in">
            <span className="text-emerald-600 select-none">&gt;&gt;</span>
            <span className={idx === streamIdx ? 'text-white' : ''}>{log}</span>
          </div>
        ))}
        {streamIdx < streams.length - 1 && (
          <div className="w-1.5 h-3.5 bg-emerald-400 animate-pulse inline-block mt-0.5" />
        )}
      </div>
    </div>
  );
}

/* ==========================================
   5. Search Bar Component
   ========================================== */
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search ledger records..."}
        className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none outline-0 transition-colors"
      />
    </div>
  );
}

/* ==========================================
   6. User Profile Menu Dropdown Component
   ========================================== */
export function UserMenu() {
  const { user, logout, navigate } = useSEO();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2.5 p-1.5 hover:bg-gray-900 border border-transparent hover:border-gray-900 rounded-xl transition-all cursor-pointer"
      >
        <img 
          src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} 
          alt="User Profile avatar" 
          className="h-8 w-8 rounded-lg bg-gray-950 border border-gray-900"
        />
        <div className="hidden sm:block text-left max-w-[100px]">
          <p className="text-[11px] font-bold text-white truncate leading-tight">{user.name}</p>
          <span className="text-[9px] text-emerald-400 font-mono font-bold block">{user.credits} CR</span>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2.5 w-52 bg-gray-950 border border-gray-900 rounded-xl shadow-2xl p-2 z-50 animate-fade-in text-xs font-sans">
            <div className="p-3 border-b border-gray-900 space-y-1">
              <p className="font-bold text-white leading-none">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate leading-none">{user.email}</p>
            </div>

            <div className="p-1 space-y-0.5">
              <button
                onClick={() => { navigate('profile'); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <User className="h-4 w-4 text-emerald-400" />
                <span>My Profile Summary</span>
              </button>
              
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/20 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ==========================================
   7. Empty State Component
   ========================================== */
export function EmptyState({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-10 text-center space-y-4 max-w-md mx-auto shadow-sm">
      <div className="bg-gray-900/60 p-3.5 rounded-full border border-gray-900 w-max mx-auto text-gray-600">
        <Layout className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-gray-200">Catalog entry empty</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-sans">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg text-xs tracking-wide cursor-pointer transition-colors uppercase font-mono"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ==========================================
   8. Error State Component
   ========================================== */
export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto shadow-lg">
      <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20 w-max mx-auto text-rose-400">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono">System Diagnostic Warning</h4>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">{error || 'An unexpected socket exception was caught.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-1.5 mx-auto px-4 py-2 bg-rose-950/30 hover:bg-rose-900/20 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 font-bold tracking-wide cursor-pointer transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>RETRY SCANNING SEQUENCE</span>
        </button>
      )}
    </div>
  );
}
