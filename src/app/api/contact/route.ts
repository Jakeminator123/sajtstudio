import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import fs from 'fs/promises'
import path from 'path'
import { siteConfig } from '@/config/siteConfig'
import { getDataDir } from '@/lib/storage-paths'

// Contact entry type
interface ContactEntry {
  id: string
  name: string
  email: string
  message: string
  timestamp: string
  source: string
}

// Get contacts file path dynamically (not cached at module level)
function getContactsFile(): string {
  return path.join(getDataDir(), 'contacts.json')
}

// Get default/legacy contacts file path (for migration)
function getLegacyContactsFile(): string {
  return path.join(process.cwd(), 'data', 'contacts.json')
}

// Migrate contacts from legacy location to current location if needed
async function migrateContactsIfNeeded(currentFile: string): Promise<void> {
  // Only migrate if current file doesn't exist and we're not already using the default location
  try {
    await fs.access(currentFile)
    // File exists, no migration needed
    return
  } catch {
    // Current file doesn't exist, check if legacy file exists
  }

  const legacyFile = getLegacyContactsFile()
  
  // If current and legacy are the same, no migration needed
  if (currentFile === legacyFile) {
    return
  }

  try {
    const legacyData = await fs.readFile(legacyFile, 'utf-8')
    const contacts = JSON.parse(legacyData)
    
    if (Array.isArray(contacts) && contacts.length > 0) {
      // Ensure current directory exists
      const currentDir = path.dirname(currentFile)
      await fs.mkdir(currentDir, { recursive: true })
      
      // Copy contacts to new location
      await fs.writeFile(currentFile, JSON.stringify(contacts, null, 2), 'utf-8')
      
      console.log(
        `✅ Migrated ${contacts.length} contacts from ${legacyFile} to ${currentFile}`
      )
      
      // Optionally backup the legacy file (rename it)
      try {
        const backupFile = `${legacyFile}.migrated-${Date.now()}`
        await fs.rename(legacyFile, backupFile)
        console.log(`✅ Backed up legacy file to ${backupFile}`)
      } catch {
        // Backup failed, but migration succeeded - that's okay
      }
    }
  } catch (error) {
    // Legacy file doesn't exist or is invalid - that's fine, no migration needed
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('Could not migrate contacts from legacy location:', error)
    }
  }
}

// Ensure data directory exists and save contact to file
async function saveContact(contact: Omit<ContactEntry, 'id'>) {
  try {
    const contactsFile = getContactsFile()
    
    // Migrate contacts from legacy location if needed
    await migrateContactsIfNeeded(contactsFile)
    
    // Ensure data directory exists
    const dataDir = path.dirname(contactsFile)
    await fs.mkdir(dataDir, { recursive: true })

    // Read existing contacts
    let contacts: ContactEntry[] = []
    try {
      const data = await fs.readFile(contactsFile, 'utf-8')
      contacts = JSON.parse(data)
    } catch {
      // File doesn't exist yet, start with empty array
      contacts = []
    }

    // Generate unique ID
    const id = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Add new contact
    const newContact: ContactEntry = {
      id,
      ...contact,
    }
    contacts.push(newContact)

    // Save to file
    await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2), 'utf-8')

    console.log(`✅ Contact saved to ${contactsFile}:`, { id, email: contact.email })
    return newContact
  } catch (error) {
    console.error('Error saving contact to file:', error)
    // Don't throw - we don't want to fail the request just because file save failed
    return null
  }
}

// Lazy initialization - only create Resend instance when API key exists
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, source } = body

    // Trim and validate required fields
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const trimmedEmail = typeof email === 'string' ? email.trim() : ''
    const trimmedMessage = typeof message === 'string' ? message.trim() : ''
    const contactSource = typeof source === 'string' ? source : 'website'

    // Message is required, but name and email can be optional (use defaults)
    if (!trimmedMessage) {
      return NextResponse.json({ error: 'Meddelandet är obligatoriskt' }, { status: 400 })
    }

    // Use defaults if name or email is missing
    const finalName = trimmedName || 'Anonym besökare'
    const finalEmail = trimmedEmail || 'anonym@sajtstudio.se'

    // Validate email format (only if email is provided and not anonymous)
    if (trimmedEmail && finalEmail !== 'anonym@sajtstudio.se') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 })
      }
    }

    // Save contact to JSON file (always, regardless of email sending status)
    await saveContact({
      name: finalName,
      email: finalEmail,
      message: trimmedMessage,
      timestamp: new Date().toISOString(),
      source: contactSource,
    })

    // Send email using Resend (optional - works without API key)
    const resend = getResend()
    if (!resend) {
      // No Resend API key configured - contact is already saved, just return success
      return NextResponse.json(
        { success: true, message: 'Strålande, vi återkommer inom kort!' },
        { status: 200 }
      )
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Sajtstudio Kontaktformulär <onboarding@resend.dev>', // You'll need to verify your domain with Resend
        to: [siteConfig.contact.email],
        subject: `Nytt meddelande från ${finalName} - Sajtstudio`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000; border-bottom: 2px solid #0066FF; padding-bottom: 10px;">
              Nytt meddelande från kontaktformuläret
            </h2>
            <div style="margin-top: 20px;">
              <p><strong>Från:</strong> ${finalName}</p>
              <p><strong>E-post:</strong> <a href="mailto:${finalEmail}">${finalEmail}</a></p>
            </div>
            <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-left: 4px solid #0066FF;">
              <h3 style="color: #000; margin-top: 0;">Meddelande:</h3>
              <p style="color: #333; white-space: pre-wrap;">${trimmedMessage.replace(
                /\n/g,
                '<br>'
              )}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>Detta meddelande skickades från kontaktformuläret på sajtstudio.se</p>
            </div>
          </div>
        `,
        replyTo: finalEmail !== 'anonym@sajtstudio.se' ? finalEmail : undefined, // So you can reply directly to the sender
      })

      if (error) {
        console.error('Resend error:', error)
        // In development, still log and return success
        if (process.env.NODE_ENV === 'development') {
          console.log('Contact form submission (email failed):', {
            name: finalName,
            email: finalEmail,
            message: trimmedMessage,
          })
          return NextResponse.json(
            { success: true, message: 'Strålande, vi återkommer inom kort!' },
            { status: 200 }
          )
        }
        throw error
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent successfully:', data)
        console.log('Contact form submission:', {
          name: finalName,
          email: finalEmail,
          message: trimmedMessage,
        })
      }

      return NextResponse.json(
        { success: true, message: 'Strålande, vi återkommer inom kort!' },
        { status: 200 }
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)

      // In development, still return success even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Contact form submission (email failed, dev mode):', {
          name: finalName,
          email: finalEmail,
          message: trimmedMessage,
        })
        return NextResponse.json(
          { success: true, message: 'Strålande, vi återkommer inom kort!' },
          { status: 200 }
        )
      }

      // In production, return error
      throw emailError
    }
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json({ error: 'Något gick fel. Försök igen senare.' }, { status: 500 })
  }
}

// GET endpoint to retrieve saved contacts (protected by API key)
export async function GET(request: NextRequest) {
  try {
    // Simple API key protection - require CONTACTS_API_KEY env var
    const authHeader = request.headers.get('Authorization')
    const apiKey = process.env.CONTACTS_API_KEY

    // If API key is set, require it for access
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get contacts file path and migrate if needed
    const contactsFile = getContactsFile()
    await migrateContactsIfNeeded(contactsFile)

    // Read contacts from file
    try {
      const data = await fs.readFile(contactsFile, 'utf-8')
      const contacts: ContactEntry[] = JSON.parse(data)

      // Sort by timestamp, newest first
      contacts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return NextResponse.json({
        success: true,
        count: contacts.length,
        contacts,
      })
    } catch {
      // File doesn't exist - return empty array
      return NextResponse.json({
        success: true,
        count: 0,
        contacts: [],
      })
    }
  } catch (error) {
    console.error('Error reading contacts:', error)
    return NextResponse.json({ error: 'Could not read contacts' }, { status: 500 })
  }
}
