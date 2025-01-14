import { File } from '@pdftron/webviewer-react-toolkit';

/**
 * Takes a file at `source` and splits it into an array of `File`, one for each
 * page of the original file.
 * @param source The source of the file to split.
 */
export async function splitPages(source: string): Promise<File[]> {
  const newFiles = [];
  const document = await window.CoreControls.createDocument(source);

  // Here, we split up the loaded PDF into multiple files, one for each page.
  for (let i = 1; i <= document.getPageCount(); i++) {
    newFiles.push(
      new File({
        // Add page number to beginning of file name.
        name: `${i}_${document.getFilename()}`,
        fileObj: async () => {
          const xfdf = await document.extractXFDF([i]);
          const data = await document.extractPages([i], xfdf.xfdfString);
          const arr = new Uint8Array(data);
          return new Blob([arr], { type: 'application/pdf' });
        },
      }),
    );
  }

  return newFiles;
}

/**
 * Joins multiple files into a single file. This is used for joining pages into
 * a single file.
 * @param files An array of files to join.
 */
export async function joinPages(files: File[]): Promise<File> {
  const firstFile = files[0];

  // Remove page number prefix added in `splitPages`.
  const found = firstFile.name.match(/^\d+_(.+)/);
  const name = found![1];

  // Create a clone of the first page file since the next operation to add pages
  // is a mutating operation, and we don't want to mutate the page file.
  const clone = firstFile.clone({ name });

  // For each file after the initial one (which was used already to create the
  // clone) we insert that file as a new page into the clone documentObj. We use
  // `updateDocumentObj` to let the clone know that a mutation is occuring on
  // the documentObj so it can update the internal Blob.
  for (let i = 1; i < files.length; i++) {
    const file = files[i];
    const document = await file.documentObj.get();
    const pageNumbers = Array.from({ length: document.getPageCount() }, (_, k) => k + 1);

    await clone.updateDocumentObj(async documentObj => {
      await documentObj.insertPages(document, pageNumbers, documentObj.getPageCount() + 1);
    });
  }

  return clone;
}
