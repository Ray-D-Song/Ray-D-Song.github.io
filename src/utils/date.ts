function formatDate(dateString: string, weekday: boolean = true): string {
  const date = new Date(dateString);
  if (weekday) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export { formatDate }