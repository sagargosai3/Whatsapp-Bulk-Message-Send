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
      console.log('🔍 Searching for contact:', phoneNumber);
      const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
      console.log('📱 Clean number:', cleanNumber);
      
      const contact = await this.searchContactByPhone(cleanNumber);
      console.log('👤 Found contact:', contact);
      
      if (contact) {
        const result = await this.updateContact(contact.id, { PC: 'Yes' });
        console.log('✅ Update result:', result);
        return result;
      } else {
        console.log('❌ No contact found for:', cleanNumber);
        // Try alternative search patterns
        const alternatives = [
          cleanNumber.replace(/^\+91/, ''),  // Remove +91
          cleanNumber.replace(/^91/, ''),    // Remove 91
          '+91' + cleanNumber.replace(/^\+?91?/, '') // Add +91
        ];
        
        for (const altNumber of alternatives) {
          console.log('🔄 Trying alternative:', altNumber);
          const altContact = await this.searchContactByPhone(altNumber);
          if (altContact) {
            console.log('✅ Found with alternative:', altNumber);
            return await this.updateContact(altContact.id, { PC: 'Yes' });
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Zoho integration error:', error);
      return false;
    }
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