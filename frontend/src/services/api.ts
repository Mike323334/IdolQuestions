import { auth } from './firebase';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  existing_options?: string[];
  target_count?: number;
}

export interface OptionGenerationResponse {
  options: string[];
  success: boolean;
  message: string;
}

export interface UsernameCheckRequest {
  username: string;
}

export interface UsernameCheckResponse {
  available: boolean;
  message: string;
}

export interface QuestionProposal {
  id?: string;
  question_text: string;
  options: string[];
  correct_answer?: number | null;
  category?: string;
  explanation?: string;
  follower_id: string;
  follower_name: string;
  creator_id: string;
  creator_name: string;
  status: string;
  created_at?: string;
  reviewed_at?: string;
  review_comment?: string;
}

export interface CreateProposalRequest {
  question_text: string;
  options: string[];
  correct_answer?: number; // Optional - will be set by creator
  category?: string;
  explanation?: string;
  creator_id: string;
  creator_name: string;
}

export interface ProposalResponse {
  success: boolean;
  message: string;
  proposal_id?: string;
}

export interface ReviewProposalRequest {
  proposal_id: string;
  status: string;
  correct_answer?: number;
  review_comment?: string;
}

export interface ProposalsListResponse {
  proposals: QuestionProposal[];
  success: boolean;
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
        existing_options: request.existing_options,
        target_count: request.target_count,
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

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    if (response.ok) {
      const data = await response.json();
      console.log('Backend test successful:', data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

export interface QuizAccessResponse {
  has_access: boolean;
  payment_verified?: boolean;
  access_granted_at?: string;
  amount_paid?: number;
  message?: string;
}

export const checkQuizAccess = async (quizId: string): Promise<QuizAccessResponse> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para verificar acceso.');
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}/access`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking quiz access:', error);
    throw error;
  }
};

export const checkUsernameAvailability = async (username: string): Promise<UsernameCheckResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

export const createQuestionProposal = async (request: CreateProposalRequest): Promise<ProposalResponse> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para proponer preguntas.');
    }

    const response = await fetch(`${API_BASE_URL}/api/propose-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
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
    console.error('Error creating question proposal:', error);
    throw error;
  }
};

export const getReceivedProposals = async (): Promise<ProposalsListResponse> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para ver las propuestas.');
    }

    const response = await fetch(`${API_BASE_URL}/api/proposals/received`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting received proposals:', error);
    throw error;
  }
};

export const getSentProposals = async (): Promise<ProposalsListResponse> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para ver tus propuestas.');
    }

    const response = await fetch(`${API_BASE_URL}/api/proposals/sent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting sent proposals:', error);
    throw error;
  }
};

export const reviewProposal = async (proposalId: string, request: ReviewProposalRequest): Promise<ProposalResponse> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para revisar propuestas.');
    }

    const response = await fetch(`${API_BASE_URL}/api/proposals/${proposalId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
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
    console.error('Error reviewing proposal:', error);
    throw error;
  }
};

export interface ContentCreator {
  id: string;
  username: string;
  email: string;
}

export const getContentCreators = async (): Promise<ContentCreator[]> => {
  try {
    // Try the main endpoint first
    const response = await fetch(`${API_BASE_URL}/api/content-creators`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.creators || [];
    }

    // If main endpoint fails, try the alternative endpoint
    const altResponse = await fetch(`${API_BASE_URL}/api/creators`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (altResponse.ok) {
      const altData = await altResponse.json();
      return altData.creators || [];
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error getting content creators:', error);
    throw error;
  }
};
