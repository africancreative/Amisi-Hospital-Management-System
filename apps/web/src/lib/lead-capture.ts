// Client-side lead capture utility
export interface LeadCaptureConfig {
  apiUrl?: string;
  source?: string;
  landingPage?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export function initLeadCapture(config: LeadCaptureConfig = {}) {
  const apiUrl = config.apiUrl || `${window.location.origin}/api/public/leads`;
  
  return {
    submitForm: async (formData: {
      name: string;
      organization: string;
      email: string;
      phone?: string;
      facilityType?: string;
      requestedModules?: string[];
      message?: string;
    }) => {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            source: config.source || 'Website',
            landingPage: config.landingPage || window.location.pathname,
            utmParams: getUTMParams(),
          }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        config.onSuccess?.(data);
        return data;
      } catch (error) {
        config.onError?.(error);
        throw error;
      }
    },
  };
}

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    ref: params.get('ref'),
  };
}

// Auto-capture from form element
export function autoCaptureForm(formId: string, config: LeadCaptureConfig = {}) {
  const capture = initLeadCapture(config);
  const form = document.getElementById(formId) as HTMLFormElement;
  
  if (!form) {
    console.error(`Form with id "${formId}" not found`);
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      organization: formData.get('organization') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      facilityType: formData.get('facilityType') as string || undefined,
      requestedModules: formData.getAll('modules') as string[] || undefined,
      message: formData.get('message') as string || undefined,
    };

    try {
      await capture.submitForm(data);
      form.reset();
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  });
}
