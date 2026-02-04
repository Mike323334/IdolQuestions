import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface QuestionGenerationRequest {
  creator_name: string;
  creator_niche?: string;
  creator_bio?: string;
  number_of_questions?: number;
  question_type?: string;
  target_audience?: string;
}

export interface GeneratedQuestion {
  text: string;
  options: string[];
  category: string;
  label: string;
  explanation?: string;
}

export interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  success: boolean;
  message: string;
}

export interface OptionGenerationRequest {
  question_text: string;
  creator_name?: string;
  creator_niche?: string;
  creator_bio?: string;
}

export interface OptionGenerationResponse {
  options: string[];
  success: boolean;
  message: string;
}

export const generateQuestions = async (
  request: QuestionGenerationRequest
): Promise<QuestionGenerationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creator_name: request.creator_name,
        creator_niche: request.creator_niche,
        creator_bio: request.creator_bio,
        number_of_questions: request.number_of_questions || 5,
        question_type: request.question_type || 'engaging',
        target_audience: request.target_audience || 'fans',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const generateQuestionOptions = async (
  request: OptionGenerationRequest
): Promise<OptionGenerationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question_text: request.question_text,
        creator_name: request.creator_name,
        creator_niche: request.creator_niche,
        creator_bio: request.creator_bio,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating options:', error);
    throw error;
  }
};

export interface StripeConnectResponse {
  account_id: string;
  onboarding_url: string;
  success: boolean;
}

export const createStripeConnectAccount = async (
  email?: string
): Promise<StripeConnectResponse> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para conectar Stripe.');
    }
    const response = await fetch(`${API_BASE_URL}/api/stripe/connect-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let message = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody?.detail) {
          message = errorBody.detail;
        }
      } catch (parseError) {
        // Ignore JSON parsing errors
      }
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Stripe connect account:', error);
    throw error;
  }
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
