require 'json'

mapping = {}
ARGF.each_line do |line|
  stroke, char = line.chomp.split
  mapping[stroke] = char
end

puts JSON.pretty_generate(mapping)
