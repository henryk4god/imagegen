document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prompt-form');
    const submitButton = document.getElementById('submit-button');
    const resultsContainer = document.getElementById('results-container');
    const promptOutput = document.getElementById('prompt-output');
    const errorMessage = document.getElementById('error-message');

    // NOTE: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYMbeHCJO7bEWHgHN4dfX7HxWKRn1spUZfQkZMWQsasgI_WWeoY7Y1DhJxpFr2vmU7YQ/exec'; 

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.classList.remove('pulse');
        errorMessage.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        promptOutput.textContent = '';


        // 1. Get form data
        const formData = new FormData(form);
        const marketingAsset = formData.get('marketingAsset');
        const productPromise = formData.get('productPromise');

        // 2. Create the full prompt content to send to the backend
        const userPrompt = `
You are an expert visual designer with 20+ years of experience in creating high-converting digital product images.
Your task is to generate a professional image-generation prompt for the selected marketing asset: ${marketingAsset}.
Use the user-submitted placeholder:
Product promise: "${productPromise}"

Instructions for the output you must generate:
no introduction
no conclusion
only the final outcome
write a complete, clean, ready-to-copy prompt the user can paste into Gemini AI to generate the image
focus on clarity, color direction, layout, emotion, and conversion psychology
integrate the product promise naturally into the visual description
add styling instructions, lighting, angles, and design tone
format the prompt in a single block suitable for image generation tools
avoid extra explanations—only deliver the final crafted prompt

Structure you must follow when creating the final output:
1. Identify the selected marketing asset.
2. Create a compelling visual direction based on the product promise.
3. Provide design style: colors, lighting, contrasts, background, typography mood.
4. Specify format: aspect ratio, shot type, angle, composition.
5. Deliver the final Gemini-ready prompt as a single block of text.
`;

        // 3. Prepare data for Apps Script (CORS bypass by using FormData and e.parameter)
        const appsScriptFormData = new FormData();
        appsScriptFormData.append('userPrompt', userPrompt);

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: appsScriptFormData 
                // IMPORTANT: Do NOT set 'Content-Type': 'application/x-www-form-urlencoded' 
                // or 'application/json' when using FormData for Apps Script e.parameter
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                promptOutput.textContent = `Error: ${data.error}`;
                errorMessage.classList.remove('hidden');
            } else {
                promptOutput.textContent = data.result || 'No prompt was generated.';
                resultsContainer.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            promptOutput.textContent = `Failed to connect to the server. (${error.message})`;
            errorMessage.classList.remove('hidden');
        } finally {
            // Revert loading state
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.classList.add('pulse');
        }
    });
});
