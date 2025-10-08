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

  async updateContactPC(phoneNumber: string): Promise<boolean> {
    try {
      console.log('🚀 Starting Zoho update for:', phoneNumber);
      
      // Try multiple phone number formats
      const phoneFormats = this.generatePhoneFormats(phoneNumber);
      
      for (const format of phoneFormats) {
        console.log('🔍 Searching with format:', format);
        const contact = await this.searchContactByPhone(format);
        
        if (contact) {
          console.log('✅ Found contact:', contact.id);
          const result = await this.updateContact(contact.id, { PC: 'Yes' });
          console.log('✅ Update successful:', result);
          return result;
        }
      }
      
      console.log('⚠️ No contact found for any format of:', phoneNumber);
      return false;
    } catch (error) {
      console.error('❌ Zoho error:', error);
      return false;
    }
  }

  private generatePhoneFormats(phoneNumber: string): string[] {
    const clean = phoneNumber.replace(/[^0-9+]/g, '');
    const formats = [clean];
    
    // Add common Indian formats
    if (clean.startsWith('+91')) {
      formats.push(clean.substring(3)); // Remove +91
      formats.push('91' + clean.substring(3)); // 91xxxxxxxxxx
    } else if (clean.startsWith('91') && clean.length === 12) {
      formats.push('+91' + clean.substring(2)); // +91xxxxxxxxxx
      formats.push(clean.substring(2)); // xxxxxxxxxx
    } else if (clean.length === 10) {
      formats.push('+91' + clean); // +91xxxxxxxxxx
      formats.push('91' + clean); // 91xxxxxxxxxx
    }
    
    return [...new Set(formats)];
  }

  private async searchContactByPhone(phoneNumber: string): Promise<Contact | null> {
    const searchUrl = `https://www.zohoapis.com/crm/v2/Contacts/search?criteria=Mobile:equals:${encodeURIComponent(phoneNumber)}`;
    console.log('🔍 Search URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    const data = await response.json();
    console.log('📊 Response data:', data);

    if (response.ok && data.data && data.data.length > 0) {
      return data.data[0];
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
}