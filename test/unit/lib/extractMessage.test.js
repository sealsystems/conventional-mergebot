const extractMessage = require('../../../lib/extractMessage')

describe('extractMessage', () => {
  it('is a function.', async () => {
    expect(extractMessage).toBeInstanceOf(Function)
  })

  it('works with empty messages.', async () => {
    const title = ''
    const body = ''

    expect(extractMessage(title, body)).toEqual({ title: '', body: '', full: '' })
  })

  it('works with a complete messages.', async () => {
    const title = 'fix: Test'
    const body = [
      '### Details',
      'details1',
      '### Breaking Changes',
      'breaking1',
      '### References',
      'ref1'
    ].join('\n')

    expect(extractMessage(title, body)).toEqual({
      title: 'fix: Test',
      body: [
        'details1',
        '',
        'BREAKING CHANGES: breaking1',
        '',
        'ref1'
      ].join('\n'),
      full: [
        'fix: Test',
        '',
        'details1',
        '',
        'BREAKING CHANGES: breaking1',
        '',
        'ref1'
      ].join('\n')
    })
  })

  it('works with empty sections.', async () => {
    const title = 'fix: Test'
    const body = [
      '### Details',
      '### Breaking Changes',
      '### References'
    ].join('\n')

    expect(extractMessage(title, body)).toEqual({
      title: 'fix: Test',
      body: '',
      full: 'fix: Test'
    })
  })

  describe('title', () => {
    it('extracts title.', async () => {
      const title = 'feat: Test'
      const body = ''
      const expected = { title: 'feat: Test', body: '', full: 'feat: Test' }

      expect(extractMessage(title, body)).toEqual(expected)
    })

    it('converts "feature" to "feat".', async () => {
      const title = 'feature: Test'
      const body = ''
      const expected = { title: 'feat: Test', body: '', full: 'feat: Test' }

      expect(extractMessage(title, body)).toEqual(expected)
    })

    it('ignores case in type keyword.', async () => {
      const title = 'FiX: Test'
      const body = ''
      const expected = { title: 'fix: Test', body: '', full: 'fix: Test' }

      expect(extractMessage(title, body)).toEqual(expected)
    })

    it('ignores spaces in title.', async () => {
      const title = '  fix   :    Test   '
      const body = ''
      const expected = { title: 'fix: Test', body: '', full: 'fix: Test' }

      expect(extractMessage(title, body)).toEqual(expected)
    })
  })

  describe('details', () => {
    it('extracts from the end of the body.', async () => {
      const body = [
        'line 1',
        'line 2',
        '## Details',
        'message 1',
        'message 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('extracts from the start of the body.', async () => {
      const body = [
        '## Details',
        'message 1',
        'message 2',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('extracts from the middle of the body.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## Details',
        'message 1',
        'message 2',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it(`ignores case when searching for section.`, async () => {
      const body = [
        '## detAILS',
        'message 1',
        'message 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it(`allows singular when searching for section.`, async () => {
      const body = [
        '## Detail',
        'message 1'
      ].join('\n')
      const expected = [
        'message 1'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('ignores # in the middle of the section.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## Details',
        'message #1',
        'message #2',
        'message ### 123',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message #1',
        'message #2',
        'message ### 123'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('trims the contents.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## Details',
        '   ',
        'message 1',
        'message 2',
        '',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })
  })

  describe('breaking changes', () => {
    it('extracts from the end of the body.', async () => {
      const body = [
        'line 1',
        'line 2',
        '## Breaking Changes',
        'message 1',
        'message 2'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('extracts from the start of the body.', async () => {
      const body = [
        '## Breaking Changes',
        'message 1',
        'message 2',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('extracts from the middle of the body.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## Breaking Changes',
        'message 1',
        'message 2',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it(`ignores case when searching for section.`, async () => {
      const body = [
        '## breaKING chaNGES',
        'message 1',
        'message 2'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it(`allows singular when searching for section.`, async () => {
      const body = [
        '## Breaking Change',
        'message 1'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message 1'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it(`allows 'Breaking' as shortcut when searching for section.`, async () => {
      const body = [
        '## Breaking',
        'message 1'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message 1'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('ignores # in the middle of the section.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## Breaking Changes',
        'message #1',
        'message #2',
        'message ### 123',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message #1',
        'message #2',
        'message ### 123'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('trims the contents.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## Breaking Changes',
        '   ',
        'message 1',
        'message 2',
        '',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'BREAKING CHANGES: message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })
  })

  describe('references', () => {
    it('extracts from the end of the body.', async () => {
      const body = [
        'line 1',
        'line 2',
        '## References',
        'message 1',
        'message 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('extracts from the start of the body.', async () => {
      const body = [
        '## References',
        'message 1',
        'message 2',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('extracts from the middle of the body.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## References',
        'message 1',
        'message 2',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it(`ignores case when searching for section.`, async () => {
      const body = [
        '## refeRENCES',
        'message 1',
        'message 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it(`allows 'Ref' as shortcut when searching for section.`, async () => {
      const body = [
        '## Ref',
        'message 1'
      ].join('\n')
      const expected = [
        'message 1'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('ignores # in the middle of the section.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## References',
        'message #1',
        'message #2',
        'message ### 123',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message #1',
        'message #2',
        'message ### 123'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })

    it('trims the contents.', async () => {
      const body = [
        '## First Section',
        'line 1',
        'line 2',
        '## References',
        '   ',
        'message 1',
        'message 2',
        '',
        '## Other Section',
        'line 1',
        'line 2'
      ].join('\n')
      const expected = [
        'message 1',
        'message 2'
      ].join('\n')

      expect(extractMessage('', body)).toEqual({ title: '', body: expected, full: expected })
    })
  })
})