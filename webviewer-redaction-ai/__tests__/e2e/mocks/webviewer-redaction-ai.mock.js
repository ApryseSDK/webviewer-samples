// This file is used to mock the server responses for document analysis in testing scenarios.

export const MOCK_DATA = {
  documentText: 'Peady, Eff, & Wright Exporting\n18th Floor, 2822 Glenoaks St.\nMargaritaville, QJ\nPhone 291 555 5555\nINVOICE\nINVOICE #398\nDATE: 4/1/2018\nTO:\nHarry Styles\nAce Deekay Shipping\n8710 Oakarum Bay\nDotjayess, EH\n427 555 5555\nCOMMENTS OR SPECIAL INSTRUCTIONS:\nPLEASE PAY ON RECEIPT OF INVOICE\nSALESPERSON\nP.O. NUMBER\nMary B. Dey\nQUANTITY\n1\n2\n20 boxes\n1\nLightweight Lawn Chair\nHelium Canister (2 cubic meters)\nHigh-strength Balloons\nSelfie-stick\n837626\nREQUISITIONER\nDamian Nowpleese\nDESCRIPTION\nSHIPPED VIA\nSpeedy Delivery\nF.O.B. POINT\nN/A\nUNIT PRICE\n89.99\n199.99\n5.00\n27.99\nTERMS\nDue on receipt\nTOTAL\n89.99\n399.98\n100.00\n27.99\nSUBTOTAL\nSALES TAX\nSHIPPING & HANDLING\nTOTAL DUE\nMake all checks payable to Peady, Eff, & Wright Exporting.\nIf you have any questions concerning this invoice, contact: us at 291 555 5555 or info@peadyeffwrighters.com.\n617.96\n30.90\n45.00\n693.86\nTHANK YOU FOR YOUR BUSINESS!\nCarrie Underwood: 1234-5678-3456-8494\nJohn Smith: 8374-3938-3198-0989\nEdward Harrison: 8937-1834-0934-1789\nMary Wang: 2233-7987-1235-9087\nLisa Fay: 6753-2654-0988-1123\nBen Franklin: 4455-346543-31003',
  analysisText: 'Address: 18th Floor, 2822 Glenoaks St.\nAddress: Margaritaville, QJ\nPerson: Harry Styles\nPhone: 291 555 5555\nAddress: 8710 Oakarum Bay\nAddress: Dotjayess, EH\nPhone: 427 555 5555\nPerson: Mary B. Dey\nPerson: Damian Nowpleese\nEmail: info@peadyeffwrighters.com\nPerson: Carrie Underwood\nCredit Card: 1234-5678-3456-8494\nPerson: John Smith\nCredit Card: 8374-3938-3198-0989\nPerson: Edward Harrison\nCredit Card: 8937-1834-0934-1789\nPerson: Mary Wang\nCredit Card: 2233-7987-1235-9087\nPerson: Lisa Fay\nCredit Card: 6753-2654-0988-1123\nPerson: Ben Franklin\nCredit Card: 4455-346543-31003'
};

// Utility function to safely parse JSON
// returning an empty object on failure.
const safeJsonParse = (value) => {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
};

// Helper function to create a JSON
// response for route fulfillment.
const jsonResponse = (payload) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(payload)
});

// Registers API route mocks for the AI PII redaction tool tests.
export const registerApiRouteMocks = async (page) => {
  const calls = {
    sendText: 0,
    analyzePII: 0,
    getResults: 0,
    sendTextPayload: null,
    analyzePIIPayload: null
  };

  // Mocking the send-text endpoint to capture document text and return a success response.
  await page.route('**/api/send-text', async (route) => {
    calls.sendText += 1;
    calls.sendTextPayload = safeJsonParse(route.request().postData());

    await route.fulfill(jsonResponse({
      success: true,
      message: 'Document text received successfully',
      textLength: calls.sendTextPayload.documentText?.length || 0,
      pageCount: calls.sendTextPayload.documentText?.pageCount || 0
    }));
  });

  // Mocking the analyze-pii endpoint to capture analysis requests and return a success response.
  await page.route('**/api/analyze-pii', async (route) => {
    calls.analyzePII += 1;
    calls.analyzePIIPayload = safeJsonParse(route.request().postData());

    await route.fulfill(jsonResponse({
      success: true,
      message: 'PII analysis completed'
    }));
  });

  // Mocking the get-results endpoint to return the analysis results.
  await page.route('**/api/get-results', async (route) => {
    calls.getResults += 1;
    await route.fulfill(jsonResponse({
      success: true,
      message: 'Document analyzed successfully with AI',
      aiProcessing: true,
      analysis: MOCK_DATA.analysisText
    }));
  });

  return calls;
};