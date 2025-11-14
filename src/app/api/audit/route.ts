import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL krävs' },
        { status: 400 }
      );
    }

    // Normalisera URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Hämta hemsideinnehåll
    const websiteContent = await fetchWebsiteContent(normalizedUrl);
    if (!websiteContent) {
      return NextResponse.json(
        { error: 'Kunde inte hämta hemsideinnehåll' },
        { status: 400 }
      );
    }

    // Extrahera domän från URL
    const domain = normalizedUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Analysera med AI (Skylight API)
    const audit = await analyzeWithAI(domain, websiteContent);

    if (!audit) {
      return NextResponse.json(
        { error: 'Kunde inte generera audit' },
        { status: 500 }
      );
    }

    return NextResponse.json({ audit, domain, url: normalizedUrl });
  } catch (error: any) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: error.message || 'Ett fel uppstod vid audit' },
      { status: 500 }
    );
  }
}

async function fetchWebsiteContent(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 }, // Don't cache
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    
    // Parse HTML (simplified - in production you'd use a proper HTML parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract headings (simplified)
    const headingMatches = html.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi) || [];
    const headings = headingMatches.slice(0, 10).map((h: string) => 
      h.replace(/<[^>]+>/g, '').trim()
    );

    // Extract text content (simplified)
    const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const wordCount = textContent.split(/\s+/).filter((w: string) => w.length > 0).length;

    return {
      url,
      title,
      description,
      headings: headings.filter((h: string) => h.length > 0),
      text_preview: textContent.substring(0, 2000),
      word_count: wordCount,
    };
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

async function analyzeWithAI(domain: string, websiteContent: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY saknas i miljövariabler');
  }

  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey: apiKey,
  });

  const prompt = `Du är en senior Growth/SEO/UX-konsult. Analysera webbplatsen och leverera ENDAST giltig JSON enligt schemat nedan.

HEMSIDAINFORMATION:
- URL: ${websiteContent.url}
- Domän: ${domain}
- Titel: ${websiteContent.title}
- Beskrivning: ${websiteContent.description}
- Antal ord: ${websiteContent.word_count}
- Rubriker: ${websiteContent.headings.slice(0, 5).join(', ')}
- Textförhandsvisning: ${websiteContent.text_preview.substring(0, 1000)}

UPPGIFT:
Gör en balanserad analys. Identifiera både styrkor och svagheter.

Analysera:
1. Hemsidans kvalitet: Hur väl fungerar sajten?
2. Tekniska aspekter: SEO, UX, innehåll, prestanda, tillgänglighet
3. Konkreta förbättringar: Quick wins och roadmap

LEVERERA JSON MED FÖLJANDE FORM:
{
  "audit_scores": {
    "seo": 0,
    "technical_seo": 0,
    "ux": 0,
    "content": 0,
    "performance": 0,
    "accessibility": 0
  },
  "strengths": [],
  "issues": [],
  "improvements": {
    "quick_wins": [{"item": "", "impact": "high|medium|low", "effort": "low|medium|high", "why": "", "how": ""}],
    "roadmap": [{"item": "", "why": "", "how": ""}]
  },
  "projected_impact": {
    "traffic_uplift_pct_range": [0, 0],
    "conv_rate_uplift_pct_range": [0, 0]
  },
  "pitch": {
    "headline": "",
    "summary": "",
    "next_steps": [""]
  }
}

REGLER:
- Svara ENDAST med giltig JSON (ingen extra text).
- Sätt 1–10 i betyg; motivera i issues/strengths.
- Ange procenttal som heltal eller flyttal 0–100.
- Var specifik och konkret med förbättringsförslag.`;

  try {
    // Use Responses API if available (for web_search tool), otherwise fallback to chat completions
    let content = '';
    
    try {
      // Try Responses API first (for web_search capability)
      const response = await (client as any).responses.create({
        model: 'gpt-4o',
        tools: [{ type: 'web_search' }],
        input: prompt,
      });
      
      content = response.output_text || '';
    } catch (responsesError: any) {
      // Fallback to regular chat completions if Responses API not available
      console.log('Responses API not available, using chat completions:', responsesError.message);
      
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      content = completion.choices[0]?.message?.content || '';
    }

    if (!content) {
      throw new Error('Inget svar från AI');
    }

    // Parse JSON från response
    try {
      const audit = JSON.parse(content);
      return audit;
    } catch (parseError) {
      // Försök hitta JSON-block om det finns extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Kunde inte parsa JSON från AI-svar');
    }
  } catch (error: any) {
    console.error('AI analysis error:', error);
    throw error;
  }
}
