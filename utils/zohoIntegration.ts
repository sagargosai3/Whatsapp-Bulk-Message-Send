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
      const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
      const contact = await this.searchContactByPhone(cleanNumber);
      
      if (contact) {
        return await this.updateContact(contact.id, { PC: 'Yes' });
      }
      
      return false;
    } catch (error) {
      console.error('Zoho integration error:', error);
      return false;
    }
  }

  private async searchContactByPhone(phoneNumber: string): Promise<Contact | null> {
    const searchUrl = `https://www.zohoapis.com/crm/v2/Contacts/search?criteria=Mobile:equals:${phoneNumber}`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.[0] || null;
    }
    
    return null;
  }

  private async updateContact(contactId: string, updateData: any): Promise<boolean> {
    const updateUrl = `https://www.zohoapis.com/crm/v2/Contacts/${contactId}`;
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [updateData]
      })
    });

    return response.ok;
  }
}