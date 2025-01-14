const CONTAINS_BLOCKLIST = [
  '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳', '⑴', '⑵', '⑶', '⑷', '⑸', '⑹', '⑺', '⑻', '⑼', '⑽', '⑾', '⑿', '⒀', '⒁', '⒂', '⒃', '⒄', '⒅', '⒆', '⒇', '⒈', '⒉', '⒊', '⒋', '⒌', '⒍', '⒎', '⒏', '⒐', '⒑', '⒒', '⒓', '⒔', '⒕', '⒖', '⒗', '⒘', '⒙', '⒚', '⒛', '⒜', '⒝', '⒞', '⒟', '⒠', '⒡', '⒢', '⒣', '⒤', '⒥', '⒦', '⒧', '⒨', '⒩', '⒪', '⒫', '⒬', '⒭', '⒮', '⒯', '⒰', '⒱', '⒲', '⒳', '⒴', '⒵', 'Ⓐ', 'Ⓑ', 'Ⓒ', 'Ⓓ', 'Ⓔ', 'Ⓕ', 'Ⓖ', 'Ⓗ', 'Ⓘ', 'Ⓙ', 'Ⓚ', 'Ⓛ', 'Ⓜ', 'Ⓝ', 'Ⓞ', 'Ⓟ', 'Ⓠ', 'Ⓡ', 'Ⓢ', 'Ⓣ', 'Ⓤ', 'Ⓥ', 'Ⓦ', 'Ⓧ', 'Ⓨ', 'Ⓩ', 'ⓐ', 'ⓑ', 'ⓒ', 'ⓓ', 'ⓔ', 'ⓕ', 'ⓖ', 'ⓗ', 'ⓘ', 'ⓙ', 'ⓚ', 'ⓛ', 'ⓜ', 'ⓝ', 'ⓞ', 'ⓟ', 'ⓠ', 'ⓡ', 'ⓢ', 'ⓣ', 'ⓤ', 'ⓥ', 'ⓦ', 'ⓧ', 'ⓨ', 'ⓩ', '⓪', '⓫', '⓬', '⓭', '⓮', '⓯', '⓰', '⓱', '⓲', '⓳', '⓴', '⓵', '⓶', '⓷', '⓸', '⓹', '⓺', '⓻', '⓼', '⓽', '⓾', '⓿',
  '127.',
  '172.',
  '192.168.',
  '169.254.',
  '2130706433',
  '3232235521',
  '3232235777',
  '2852039166',
  '7147006462',
  '0xA9FEA9FE',
  '0x41414141A9FEA9FE',
  '425.510.',
  '0xA9.0xFE.',
  '0251.0376.',
  '0251.00376.',
  '1ynrnhl',
];

const STARTSWITH_BLOCKLIST = [
  '0.',
  '10.',
  'fc',
  'fd',
  'fe',
  'ff',
  '::1',
  'instance-data',
  'metadata',
  'localtest',
];

const isValidURL = (queriedUrl: string, allowHTTPProxy = false, allowPotentiallyUnsafeURL = false): boolean => {
  if (allowPotentiallyUnsafeURL) {
    return true;
  }

  // check for lowercase here and not outside as some URLs are uppercased
  const url = queriedUrl.toLowerCase();

  // Check the block list of forbidden sites.
  if (CONTAINS_BLOCKLIST.some((el) => url.includes(el.toLowerCase()))) {
    return false;
  }

  try {
    const { hostname, port, protocol } = new URL(url);

    if (!allowHTTPProxy) {
      // Be suspicious of anything that supplies a port.
      if (protocol === 'http:' || port) {
        return false;
      }
    }

    // Check if domain starts with a number
    if ((/^[0-9]/.test(hostname))) {
      return false;
    }

    // Confirm this is a domain not an IP address by checking the hostname
    // ends with a two-letter or three-letter domain.
    if (!(/[a-zA-Z]{2,3}$/.test(hostname))) {
      return false;
    }

    // Check the block list of forbidden sites.
    if (STARTSWITH_BLOCKLIST.some((el) => hostname.startsWith(el))) {
      return false;
    }
    if (CONTAINS_BLOCKLIST.some((el) => hostname.includes(el.toLowerCase()))) {
      return false;
    }

    return /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi.test(url);
  } catch {
    return false;
  }
};

export { isValidURL };