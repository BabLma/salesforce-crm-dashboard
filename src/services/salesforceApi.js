// Salesforce REST API Service
import { getAuthTokens, refreshAccessToken } from '../auth/salesforceAuth';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';
const API_VERSION = import.meta.env.VITE_SALESFORCE_API_VERSION || 'v58.0';
const MIN_CREATED_DATE = '2026-01-25T00:00:00Z';

/**
 * Makes authenticated API calls to Salesforce via proxy
 */
const apiRequest = async (endpoint, options = {}) => {
  const { accessToken, instanceUrl } = getAuthTokens();

  if (!accessToken || !instanceUrl) {
    throw new Error('Not authenticated');
  }

  // Use proxy server to avoid CORS
  const proxyUrl = `${PROXY_URL}/api/salesforce${endpoint}`;

  const headers = {
    'access_token': accessToken,
    'instance_url': instanceUrl,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(proxyUrl, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      // Try to refresh token
      const newToken = await refreshAccessToken();

      // Retry request with new token
      headers['access_token'] = newToken;
      const retryResponse = await fetch(proxyUrl, {
        ...options,
        headers,
      });

      if (!retryResponse.ok && retryResponse.status !== 204) {
        throw new Error(`API request failed: ${retryResponse.statusText}`);
      }

      // Handle 204 No Content (e.g., DELETE)
      if (retryResponse.status === 204) {
        return null;
      }

      return await retryResponse.json();
    }

    // Handle 204 No Content (e.g., DELETE)
    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();

      // Special handling for duplicate detection
      // When DUPLICATES_DETECTED occurs, Salesforce doesn't create the record
      // We need to rethrow with the full error data for proper handling
      if (error[0]?.errorCode === 'DUPLICATES_DETECTED') {
        const err = new Error(error[0]?.message || 'Duplicate detected');
        err.duplicateError = error[0]; // Attach full error data
        throw err;
      }

      throw new Error(error[0]?.message || error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Fetches all Contacts from Salesforce (only records created on/after 1/25/2026)
 */
export const getContacts = async () => {
  const query = encodeURIComponent(
    `SELECT Id, Name, Email, Phone, Account.Name, CreatedDate FROM Contact WHERE CreatedDate >= ${MIN_CREATED_DATE} ORDER BY CreatedDate DESC LIMIT 100`
  );

  const contactsResult = await apiRequest(`/services/data/${API_VERSION}/query/?q=${query}`);

  // Get all converted leads to match with contacts by name/email
  const leadsQuery = encodeURIComponent(
    `SELECT Name, Email, Status FROM Lead WHERE Status = 'Closed - Converted' AND CreatedDate >= ${MIN_CREATED_DATE}`
  );
  const leadsResult = await apiRequest(`/services/data/${API_VERSION}/query/?q=${leadsQuery}`);

  // Create a map of converted lead emails and names
  const convertedLeads = new Map();
  if (leadsResult.records) {
    leadsResult.records.forEach(lead => {
      if (lead.Email) {
        convertedLeads.set(lead.Email.toLowerCase(), true);
      }
      convertedLeads.set(lead.Name.toLowerCase(), true);
    });
  }

  // Add convertedFromLead flag to contacts based on matching email or name
  if (contactsResult.records) {
    contactsResult.records = contactsResult.records.map(contact => ({
      ...contact,
      convertedFromLead:
        (contact.Email && convertedLeads.has(contact.Email.toLowerCase())) ||
        convertedLeads.has(contact.Name.toLowerCase())
    }));
  }

  return contactsResult;
};

/**
 * Fetches all Leads from Salesforce (only records created on/after 1/25/2026)
 */
export const getLeads = async () => {
  const query = encodeURIComponent(
    `SELECT Id, Name, Email, Phone, Company, Status, IsConverted, ConvertedContactId, CreatedDate FROM Lead WHERE CreatedDate >= ${MIN_CREATED_DATE} ORDER BY CreatedDate DESC LIMIT 100`
  );

  return await apiRequest(`/services/data/${API_VERSION}/query/?q=${query}`);
};

/**
 * Creates a new Contact in Salesforce
 */
export const createContact = async (contactData) => {
  return await apiRequest(`/services/data/${API_VERSION}/sobjects/Contact`, {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
};

/**
 * Updates a Contact in Salesforce
 */
export const updateContact = async (contactId, contactData) => {
  return await apiRequest(`/services/data/${API_VERSION}/sobjects/Contact/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify(contactData),
  });
};

/**
 * Updates a Lead status in Salesforce
 */
export const updateLeadStatus = async (leadId, status) => {
  return await apiRequest(`/services/data/${API_VERSION}/sobjects/Lead/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify({ Status: status }),
  });
};

/**
 * Deletes a Contact from Salesforce
 */
export const deleteContact = async (contactId) => {
  return await apiRequest(`/services/data/${API_VERSION}/sobjects/Contact/${contactId}`, {
    method: 'DELETE',
  });
};

/**
 * Converts a Lead to Contact and Account manually
 * Checks for existing contacts to avoid duplicates
 */
export const convertLead = async (leadId) => {
  // Step 1: Get the lead details
  const leadQuery = encodeURIComponent(
    `SELECT Id, FirstName, LastName, Name, Email, Phone, Company FROM Lead WHERE Id = '${leadId}'`
  );
  const leadResponse = await apiRequest(`/services/data/${API_VERSION}/query/?q=${leadQuery}`);

  if (!leadResponse.records || leadResponse.records.length === 0) {
    throw new Error('Lead not found');
  }

  const lead = leadResponse.records[0];

  let accountId;
  let contactId;
  let contactSearch = null;

  // Step 2: Check if Contact with same email already exists
  if (lead.Email) {
    const contactQuery = encodeURIComponent(
      `SELECT Id, AccountId FROM Contact WHERE Email = '${lead.Email}' LIMIT 1`
    );
    contactSearch = await apiRequest(`/services/data/${API_VERSION}/query/?q=${contactQuery}`);

    if (contactSearch.records && contactSearch.records.length > 0) {
      // Use existing contact
      contactId = contactSearch.records[0].Id;
      accountId = contactSearch.records[0].AccountId;
    }
  }

  // Step 3: If no existing contact, create new Account and Contact
  if (!contactId) {
    // Check if Account with same name already exists
    const accountQuery = encodeURIComponent(
      `SELECT Id FROM Account WHERE Name = '${lead.Company || 'Unknown Company'}' LIMIT 1`
    );
    const accountSearch = await apiRequest(`/services/data/${API_VERSION}/query/?q=${accountQuery}`);

    if (accountSearch.records && accountSearch.records.length > 0) {
      // Use existing account
      accountId = accountSearch.records[0].Id;
    } else {
      // Create new Account from Company
      const accountData = {
        Name: lead.Company || 'Unknown Company',
      };
      const accountResult = await apiRequest(`/services/data/${API_VERSION}/sobjects/Account`, {
        method: 'POST',
        body: JSON.stringify(accountData),
      });
      accountId = accountResult.id;
    }

    // Create Contact from Lead - check by FirstName, LastName, and AccountId to avoid duplicates
    const exactContactQuery = encodeURIComponent(
      `SELECT Id FROM Contact WHERE FirstName = '${lead.FirstName}' AND LastName = '${lead.LastName}' AND AccountId = '${accountId}' LIMIT 1`
    );
    const exactContactSearch = await apiRequest(`/services/data/${API_VERSION}/query/?q=${exactContactQuery}`);

    if (exactContactSearch.records && exactContactSearch.records.length > 0) {
      // Contact already exists with same name at this Account
      contactId = exactContactSearch.records[0].Id;
    } else {
      // Create Contact from Lead - allow duplicates since we're converting from Lead
      const contactData = {
        FirstName: lead.FirstName,
        LastName: lead.LastName,
        Email: lead.Email,
        Phone: lead.Phone,
        AccountId: accountId,
      };

      try {
        const contactResult = await apiRequest(`/services/data/${API_VERSION}/sobjects/Contact`, {
          method: 'POST',
          headers: {
            'Sforce-Duplicate-Rule-Header': 'allowSave=true',
          },
          body: JSON.stringify(contactData),
        });
        contactId = contactResult.id;
      } catch (error) {
        // If duplicate error, the record might still have been created
        // Query for the contact that was just created
        if (error.message?.includes('duplicate') || error.message?.includes('Duplicate')) {
          const newContactQuery = encodeURIComponent(
            `SELECT Id FROM Contact WHERE FirstName = '${lead.FirstName}' AND LastName = '${lead.LastName}' AND AccountId = '${accountId}' ORDER BY CreatedDate DESC LIMIT 1`
          );
          const newContactSearch = await apiRequest(`/services/data/${API_VERSION}/query/?q=${newContactQuery}`);

          if (newContactSearch.records && newContactSearch.records.length > 0) {
            contactId = newContactSearch.records[0].Id;
          } else {
            throw error; // Re-throw if contact wasn't actually created
          }
        } else {
          throw error; // Re-throw non-duplicate errors
        }
      }
    }
  }

  // Step 4: Update Lead status to Closed - Converted
  // Note: ConvertedContactId is read-only and can only be set by Salesforce's built-in conversion
  await apiRequest(`/services/data/${API_VERSION}/sobjects/Lead/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      Status: 'Closed - Converted'
    }),
  });

  return {
    contactId,
    accountId,
    leadId,
    existingContact: !!contactSearch?.records?.length
  };
};

/**
 * Gets current user information
 */
export const getCurrentUser = async () => {
  const { userId } = getAuthTokens();
  return await apiRequest(`/services/data/${API_VERSION}/sobjects/User/${userId.split('/').pop()}`);
};
