interface ZohoConfig {
  accessToken: string;
  organizationId: string;
}

interface Contact {
  id: string;
  Mobile: string;
  PC: string;
}

export class ZohoIntegration {
  private config: ZohoConfig;

  constructor(config: ZohoConfig) {
    this.config = config;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing Zoho API connection...');
      
      const testUrl = 'https://www.zohoapis.com/crm/v2/Contacts?per_page=1';
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('🧪 Test response:', response.status, data);

      if (response.status === 401) {
        return {
          success: false,
          message: 'Token expired or invalid. Generate new token at: https://api-console.zoho.com/'
        };
      }

      if (response.ok) {
        return {
          success: true,
          message: `Connection successful! Found ${data.info?.count || 0} contacts in CRM.`
        };
      }

      return {
        success: false,
        message: `API Error: ${response.status} - ${data.message || 'Unknown error'}`
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  async updateContactPC(phoneNumber: string): Promise<boolean> {
    try {
      console.log('🚀 Starting Zoho update for:', phoneNumber);
      
      // Try multiple phone number formats
      const phoneFormats = this.generatePhoneFormats(phoneNumber);
      console.log('📝 Generated phone formats:', phoneFormats);
      
      for (const format of phoneFormats) {
        console.log('🔍 Searching with format:', format);
        const contact = await this.searchContactByPhone(format);
        
        if (contact) {
          console.log('✅ Found contact:', contact.id, 'Current PC:', contact.PC);
          const result = await this.updateContact(contact.id, { PC: 'Yes' });
          console.log('✅ Update result:', result);
          return result;
        }
      }
      
      console.log('⚠️ No contact found for any format of:', phoneNumber);
      console.log('💡 Troubleshooting tips:');
      console.log('   1. Check if contact exists in Zoho CRM');
      console.log('   2. Verify phone number format in CRM matches one of:', phoneFormats);
      console.log('   3. Ensure access token has read/write permissions');
      return false;
    } catch (error) {
      console.error('❌ Zoho error:', error);
      if (error.message.includes('Access token expired')) {
        console.error('🔑 Token expired! Generate new token at: https://api-console.zoho.com/');
      }
      return false;
    }
  }

  private generatePhoneFormats(phoneNumber: string): string[] {
    const clean = phoneNumber.replace(/[^0-9+]/g, '');
    const formats = [clean];
    
    // Add common Indian formats
    if (clean.startsWith('+91')) {
      const withoutCountryCode = clean.substring(3);
      formats.push(withoutCountryCode); // Remove +91
      formats.push('91' + withoutCountryCode); // 91xxxxxxxxxx
      formats.push('0' + withoutCountryCode); // 0xxxxxxxxxx (landline format)
    } else if (clean.startsWith('91') && clean.length === 12) {
      const withoutCountryCode = clean.substring(2);
      formats.push('+91' + withoutCountryCode); // +91xxxxxxxxxx
      formats.push(withoutCountryCode); // xxxxxxxxxx
      formats.push('0' + withoutCountryCode); // 0xxxxxxxxxx
    } else if (clean.length === 10) {
      formats.push('+91' + clean); // +91xxxxxxxxxx
      formats.push('91' + clean); // 91xxxxxxxxxx
      formats.push('0' + clean); // 0xxxxxxxxxx
    } else if (clean.startsWith('0') && clean.length === 11) {
      const withoutZero = clean.substring(1);
      formats.push('+91' + withoutZero); // +91xxxxxxxxxx
      formats.push('91' + withoutZero); // 91xxxxxxxxxx
      formats.push(withoutZero); // xxxxxxxxxx
    }
    
    // Add formats with spaces and dashes (common in CRM)
    const tenDigit = clean.replace(/^(\+91|91|0)/, '');
    if (tenDigit.length === 10) {
      formats.push(`${tenDigit.substring(0,5)} ${tenDigit.substring(5)}`);
      formats.push(`${tenDigit.substring(0,3)}-${tenDigit.substring(3,6)}-${tenDigit.substring(6)}`);
      formats.push(`+91 ${tenDigit}`);
      formats.push(`91 ${tenDigit}`);
    }
    
    return [...new Set(formats)];
  }

  private async searchContactByPhone(phoneNumber: string): Promise<Contact | null> {
    // Try both Mobile and Phone fields
    const searchFields = ['Mobile', 'Phone'];
    
    for (const field of searchFields) {
      const searchUrl = `https://www.zohoapis.com/crm/v2/Contacts/search?criteria=${field}:equals:${encodeURIComponent(phoneNumber)}`;
      console.log(`🔍 Search URL (${field}):`, searchUrl);
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📊 Response status (${field}):`, response.status);
      const data = await response.json();
      console.log(`📊 Response data (${field}):`, data);

      if (response.status === 401) {
        console.error('❌ TOKEN EXPIRED OR INVALID!');
        console.error('⚠️ Please generate a new access token from Zoho API Console');
        throw new Error('Access token expired. Please generate a new token.');
      }

      if (response.ok && data.data && data.data.length > 0) {
        console.log(`✅ Found contact in ${field} field:`, data.data[0]);
        return data.data[0];
      }
    }
    
    return null;
  }

  private async updateContact(contactId: string, updateData: any): Promise<boolean> {
    const updateUrl = `https://www.zohoapis.com/crm/v2/Contacts/${contactId}`;
    const payload = {
      data: [{
        id: contactId,
        ...updateData
      }]
    };
    
    console.log('🔄 Update URL:', updateUrl);
    console.log('📝 Update payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('⚙️ Update response:', response.status, result);
    
    return response.ok && result.data && result.data[0].status === 'success';
  }

  async searchContactsByPhone(phoneNumber: string): Promise<Contact[]> {
    const phoneFormats = this.generatePhoneFormats(phoneNumber);
    const allContacts: Contact[] = [];
    
    for (const format of phoneFormats) {
      const contact = await this.searchContactByPhone(format);
      if (contact && !allContacts.find(c => c.id === contact.id)) {
        allContacts.push(contact);
      }
    }
    
    return allContacts;
  }
}