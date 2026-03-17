content = open('src/frontend/src/pages/AdminPage.tsx').read()

old = '                  <TableCell className="font-medium">\n                    \u20b9{b.totalPrice.toLocaleString("en-IN")}\n                  </TableCell>\n                  <TableCell>\n                    <Select'

new = '                  <TableCell className="font-medium">\n                    \u20b9{b.totalPrice.toLocaleString("en-IN")}\n                  </TableCell>\n                  <TableCell>\n                    {(b.status as string) === "pending" ? (\n                      <Button\n                        size="sm"\n                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"\n                        onClick={() => handleStatusChange(b.id, "confirmed")}\n                        data-ocid={`bookings.primary_button.${i + 1}`}\n                      >\n                        Mark as Paid\n                      </Button>\n                    ) : (\n                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLORS[b.status as string] ?? ""}`}>\n                        {STATUS_LABELS[b.status as string] ?? (b.status as string)}\n                      </span>\n                    )}\n                  </TableCell>\n                  <TableCell>\n                    <Select'

if old in content:
    content = content.replace(old, new)
    open('src/frontend/src/pages/AdminPage.tsx', 'w').write(content)
    print('Done - replaced')
else:
    print('Pattern not found')
    idx = content.find('totalPrice.toLocaleString')
    print(repr(content[idx-50:idx+200]))
